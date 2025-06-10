import { NextRequest, NextResponse } from 'next/server'
import { 
  runApifyActor, 
  formatTwitterData, 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  validateEnvironment,
  withErrorHandling
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError } from '@/lib/types'

const TWITTER_ACTOR_ID = 'apify/twitter-scraper'

async function getTwitterTrending(
  query: string = '',
  location: string = 'worldwide',
  limit: number = 10
): Promise<TrendingResponse> {
  // Validate environment
  validateEnvironment()
  
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)
  
  // Prepare Apify input for Twitter scraper
  const apifyInput = {
    searchTerms: query ? [query] : ['trending'],
    maxTweets: validatedLimit,
    onlyVerified: false,
    excludeReplies: true,
    language: 'en',
    searchMode: 'top', // Get top tweets which are usually trending
  }
  
  try {
    console.log(`Fetching Twitter trending: query="${query}" location="${location}" (limit: ${validatedLimit})`)
    
    // Run Apify actor
    const rawData = await runApifyActor(TWITTER_ACTOR_ID, apifyInput, {
      timeout: 45000 // 45 seconds
    })
    
    // Transform Twitter data to trending format
    const trends = rawData.map((item, index) => ({
      name: item.hashtags?.[0] || item.text?.substring(0, 50) || `Trend ${index + 1}`,
      volume: item.replyCount + item.retweetCount + item.likeCount || 0,
      growth: `+${Math.floor(Math.random() * 200)}%`, // Mock growth for now
      tweet_volume: item.retweetCount || 0,
      url: item.url,
    }))
    
    // Log usage
    logApiUsage('Twitter', 'trending', validatedLimit, trends.length, 0.05)
    
    return {
      platform: 'twitter',
      query,
      location,
      trends,
      count: trends.length,
      timestamp: new Date().toISOString(),
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
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get trending data
    const data = await withErrorHandling(getTwitterTrending)(query, location, limit)
    
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