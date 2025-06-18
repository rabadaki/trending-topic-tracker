import { NextRequest, NextResponse } from 'next/server'
import { 
  runApifyActor, 
  formatTikTokData, 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  validateEnvironment,
  withErrorHandling,
  formatEngagementNumber,
  getEngagementLabel,
  getEngagementColor
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError, ApifyTikTokPost, TikTokTrend } from '@/lib/types'

const TIKTOK_ACTOR_ID = 'clockworks~free-tiktok-scraper'

/**
 * Fetches trending TikTok data using Apify actor.
 * Processes videos, calculates engagement, and formats for frontend display.
 * 
 * @param hashtag - Hashtag to search for
 * @param query - Search query
 * @param limit - Maximum number of results to return
 * @param hashtags - Additional hashtags for matching
 * @param keywords - Keywords to match in video content
 * @returns Promise<TrendingResponse> - Formatted trending data
 */
async function getTikTokTrending(
  hashtag: string = '',
  query: string = '',
  limit: number = 10,
  hashtags?: string[],
  keywords?: string[]
): Promise<TrendingResponse> {
  // Validate environment
  validateEnvironment()
  
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)
  
  // Prepare Apify input for TikTok scraper (optimized for trending content)
  const apifyInput = {
    searchQueries: hashtag ? [`${hashtag.replace('#', '')}`] : query ? [query] : ['productivity'], // Search for hashtag content
    resultsPerPage: validatedLimit * 2, // Get more results to filter trending ones
    hashtags: [], // Don't use hashtags parameter, use searchQueries instead
    excludePinnedPosts: false,
    shouldDownloadCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
    profileScrapeSections: ['videos'],
    profileSorting: 'popular', // Sort by popular/trending instead of latest
    searchSection: '', // Use empty string as per error message
    maxProfilesPerQuery: 50, // Increase to get more diverse content
  }
  
  try {
    console.log(`Fetching TikTok trending: hashtag="${hashtag}" query="${query}" (limit: ${validatedLimit})`)
    
    // Run Apify actor
    const rawData: ApifyTikTokPost[] = await runApifyActor(TIKTOK_ACTOR_ID, apifyInput, {
      timeout: 60000 // 60 seconds for TikTok
    })
    
    // Format the data with matching logic
    const formattedTrends: TikTokTrend[] = rawData.map((item: ApifyTikTokPost) => {
      const views = item.playCount || 0
      const likes = item.diggCount || 0
      const videoText = (item.text || item.description || '').toLowerCase()
      const videoHashtags = item.hashtags || []
      
      // Check for hashtag matches
      let matchedHashtags: string[] = []
      let hashtagMatch = false
      if (hashtags && hashtags.length > 0) {
        matchedHashtags = hashtags.filter(targetHashtag => {
          const cleanHashtag = targetHashtag.replace('#', '').toLowerCase()
          return videoHashtags.some((tag) => (tag.name || '').toLowerCase().includes(cleanHashtag)) ||
                 videoText.includes(`#${cleanHashtag}`) ||
                 videoText.includes(cleanHashtag)
        })
        hashtagMatch = matchedHashtags.length > 0
      }
      
      // Check for keyword matches (split by commas and individual words)
      let matchedKeywords: string[] = []
      let keywordMatch = false
      if (keywords && keywords.length > 0) {
        matchedKeywords = []
        
        // Only check for full phrase matches (no individual word fallback)
        keywords.forEach(keywordPhrase => {
          const phrase = keywordPhrase.toLowerCase().trim()
          if (phrase.length > 2 && videoText.includes(phrase)) {
            matchedKeywords.push(keywordPhrase) // Keep original casing for display
          }
        })
        
        keywordMatch = matchedKeywords.length > 0
      }
      
      // Determine match type
      let matchType = null
      if (hashtagMatch && keywordMatch) {
        matchType = 'both'
      } else if (hashtagMatch) {
        matchType = 'hashtag'
      } else if (keywordMatch) {
        matchType = 'keyword'
      }

      // Extract posted date
      const postedDate = item.createTime 
        ? new Date(item.createTime * 1000).toISOString() 
        : (item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString())
      
      return {
        title: item.text || item.description || item.title || '',
        views: formatEngagementNumber(views),
        likes: formatEngagementNumber(likes),
        hashtags: videoHashtags.map(tag => tag.name || '').filter(Boolean),
        video_url: item.webVideoUrl || item.playAddr,
        author: item.authorMeta?.name || item.author,
        description: item.text || item.description,
        engagement_level: getEngagementLabel(views, 'tiktok'),
        engagement_color: getEngagementColor(views, 'tiktok'),
        raw_views: views, // Keep raw number for calculations
        raw_likes: likes,
        posted_date: postedDate,
        // Add matching metadata
        matchType,
        matchedHashtags: matchedHashtags.length > 0 ? matchedHashtags : undefined,
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
      } as TikTokTrend & {
        matchType?: string | null;
        matchedHashtags?: string[];
        matchedKeywords?: string[];
      }
    })
    .sort((a, b) => {
      // Primary sort: by engagement level (Viral > High > Medium > Low)
      const levelOrder = { 'Viral': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
      const aLevel = levelOrder[a.engagement_level as keyof typeof levelOrder] || 0
      const bLevel = levelOrder[b.engagement_level as keyof typeof levelOrder] || 0
      
      // If same level, sort by raw views (higher views first)
      if (aLevel === bLevel) {
        return b.raw_views - a.raw_views
      }
      
      return bLevel - aLevel
    })
    
    // Log usage
    logApiUsage('TikTok', 'trending', validatedLimit, formattedTrends.length, 0.03)
    
    return {
      platform: 'tiktok',
      query: query || hashtag,
      trends: formattedTrends,
      count: formattedTrends.length,
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('TikTok trending error:', error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      'Failed to fetch TikTok trending data',
      'TIKTOK_FETCH_FAILED',
      error
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const hashtag = searchParams.get('hashtag') || ''
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Settings-based parameters for matching
    const hashtagsParam = searchParams.get('hashtags')
    const keywordsParam = searchParams.get('keywords')
    
    const hashtags = hashtagsParam ? hashtagsParam.split(',').slice(0, 3) : undefined
    const keywords = keywordsParam ? keywordsParam.split(',').slice(0, 3) : undefined
    
    // Get trending data
    const data = await withErrorHandling(getTikTokTrending)(hashtag, query, limit, hashtags, keywords)
    
    return NextResponse.json(createSuccessResponse(data))
    
  } catch (error) {
    console.error('TikTok API route error:', error)
    
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