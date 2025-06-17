import { NextRequest, NextResponse } from 'next/server'
import { 
  runApifyActor, 
  formatTwitterData, 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  validateEnvironment,
  withErrorHandling,
  getEngagementLabel,
  getEngagementColor
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError, ApifyTwitterPost, TwitterTrend } from '@/lib/types'

const TWITTER_ACTOR_ID = '61RPP7dywgiy0JPD0'

/**
 * Fetches trending Twitter data using Apify actor.
 * Processes tweets, calculates engagement, and formats for frontend display.
 * 
 * @param query - Search query or hashtag
 * @param location - Geographic location for trends
 * @param limit - Maximum number of results to return
 * @param timeRange - Time period for trending data
 * @param customStart - Custom start date (YYYY-MM-DD)
 * @param customEnd - Custom end date (YYYY-MM-DD)
 * @param searchTerms - Additional search terms for matching
 * @param keywords - Keywords to match in tweet content
 * @returns Promise<TrendingResponse> - Formatted trending data
 */
async function getTwitterTrending(
  query: string = '',
  location: string = 'worldwide',
  limit: number = 10,
  timeRange: '1d' | '3d' | '1w' | '1m' = '1d',
  customStart?: string,
  customEnd?: string,
  searchTerms?: string[],
  keywords?: string[]
): Promise<TrendingResponse> {
  // Validate environment
  validateEnvironment()
  
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)

  // Calculate date range
  let startDate = ''
  let endDate = ''
  
  if (customStart && customEnd) {
    // Use custom date range
    startDate = customStart
    endDate = customEnd
  } else {
    // Use time range parameter
    const now = new Date()
    endDate = now.toISOString().split('T')[0] // Today as YYYY-MM-DD
    
    const start = new Date(now)
    switch (timeRange) {
      case '1d':
        start.setDate(start.getDate() - 1)
        break
      case '3d':
        start.setDate(start.getDate() - 3)
        break
      case '1w':
        start.setDate(start.getDate() - 7)
        break
      case '1m':
        start.setMonth(start.getMonth() - 1)
        break
      default:
        start.setDate(start.getDate() - 1) // Default to 1 day
    }
    startDate = start.toISOString().split('T')[0]
  }

  // Prepare Apify input for Twitter scraper (optimized for trending)
  const apifyInput = {
    searchTerms: query ? [query] : ['#viral'], // Single hashtag for speed
    sort: 'Top',
    maxItems: validatedLimit,
    tweetLanguage: 'en',
    start: startDate,
    end: endDate,
  }
  
  try {
    console.log(`Fetching Twitter trending: query="${query}" location="${location}" (limit: ${validatedLimit})`)
    
    // Run Apify actor
    const rawData: ApifyTwitterPost[] = await runApifyActor(TWITTER_ACTOR_ID, apifyInput, {
      timeout: 30000 // 30 seconds timeout
    })
    
    // Transform Twitter data to trending format with matching logic
    const trends: TwitterTrend[] = rawData.map((item: ApifyTwitterPost) => {
      const volume = (item.replyCount || 0) + (item.retweetCount || 0) + (item.likeCount || item.favoriteCount || 0)
      const tweetText = (item.text || '').toLowerCase()
      const tweetHashtags = item.hashtags || []
      
      // Check for search term matches
      let matchedSearchTerms: string[] = []
      let searchTermMatch = false
      if (searchTerms && searchTerms.length > 0) {
        matchedSearchTerms = searchTerms.filter(term => 
          tweetText.includes(term.toLowerCase())
        )
        searchTermMatch = matchedSearchTerms.length > 0
      }
      
      // Check for keyword matches
      let matchedKeywords: string[] = []
      let keywordMatch = false
      if (keywords && keywords.length > 0) {
        matchedKeywords = keywords.filter(keyword => 
          tweetText.includes(keyword.toLowerCase())
        )
        keywordMatch = matchedKeywords.length > 0
      }
      
      // Determine match type
      let matchType = null
      if (searchTermMatch && keywordMatch) {
        matchType = 'both'
      } else if (searchTermMatch) {
        matchType = 'searchTerm'
      } else if (keywordMatch) {
        matchType = 'keyword'
      }

      // Extract posted date from multiple possible fields
      let postedDate = new Date().toISOString()
      if (item.timestamp_ms) {
        postedDate = new Date(parseInt(item.timestamp_ms)).toISOString()
      } else if (item.created_at) {
        postedDate = new Date(item.created_at).toISOString()
      } else if (item.createdAt) {
        postedDate = new Date(item.createdAt).toISOString()
      }

      return {
        name: item.text || '',
        volume,
        tweet_volume: volume,
        url: item.url || item.permalink,
        engagement_level: getEngagementLabel(volume, 'twitter'),
        engagement_color: getEngagementColor(volume, 'twitter'),
        promoted_content: null,
        posted_date: postedDate,
        // Additional metadata for matching
        matchType,
        matchedSearchTerms: matchedSearchTerms.length > 0 ? matchedSearchTerms : undefined,
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
        author: item.user?.screen_name || item.author?.username || '',
        hashtags: tweetHashtags,
      } as TwitterTrend & {
        matchType?: string | null;
        matchedSearchTerms?: string[];
        matchedKeywords?: string[];
        author?: string;
        hashtags?: string[];
      }
    })
    .sort((a, b) => {
      // Primary sort: by engagement level (Viral > High > Medium > Low)
      const levelOrder = { 'Viral': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
      const aLevel = levelOrder[a.engagement_level as keyof typeof levelOrder] || 0
      const bLevel = levelOrder[b.engagement_level as keyof typeof levelOrder] || 0
      
      // If same level, sort by volume (higher engagement first)
      if (aLevel === bLevel) {
        return b.volume - a.volume
      }
      
      return bLevel - aLevel
    })
    
    // Log usage
    logApiUsage('Twitter', 'trending', validatedLimit, trends.length, 0.02)
    
    return {
      platform: 'twitter',
      query: query || location,
      trends,
      count: trends.length,
      timestamp: new Date().toISOString(),
      location,
    }
    
  } catch (error) {
    console.error('Twitter trending error:', error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      'Failed to fetch Twitter trending data',
      'TWITTER_FETCH_FAILED',
      error
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const query = searchParams.get('query') || ''
    const location = searchParams.get('location') || 'worldwide'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    
    // Date filtering parameters (default to last 3 days for more viral content)
    const timeRange = (searchParams.get('time') || '3d') as '1d' | '3d' | '1w' | '1m'
    const customStart = searchParams.get('start_date') || undefined // YYYY-MM-DD format
    const customEnd = searchParams.get('end_date') || undefined // YYYY-MM-DD format

    // Settings-based parameters for matching
    const searchTermsParam = searchParams.get('searchTerms')
    const keywordsParam = searchParams.get('keywords')
    
    const searchTerms = searchTermsParam ? searchTermsParam.split(',').slice(0, 3) : undefined
    const keywords = keywordsParam ? keywordsParam.split(',').slice(0, 3) : undefined

    // Get trending data
    const data = await withErrorHandling(getTwitterTrending)(query, location, limit, timeRange, customStart, customEnd, searchTerms, keywords)
    
    return NextResponse.json(createSuccessResponse(data))
    
  } catch (error) {
    console.error('Twitter API route error:', error)
    
    if (error instanceof TrendingApiError) {
      return NextResponse.json(
        createErrorResponse(error.message),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}