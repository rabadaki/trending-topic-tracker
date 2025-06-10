import { NextRequest, NextResponse } from 'next/server'
import { 
  runApifyActor, 
  formatRedditData, 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  validateEnvironment,
  withErrorHandling
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError } from '@/lib/types'

const REDDIT_ACTOR_ID = 'apify/reddit-scraper'

async function getRedditTrending(
  subreddit: string = 'all',
  sort: string = 'hot',
  time: string = 'day',
  limit: number = 10
): Promise<TrendingResponse> {
  // Validate environment
  validateEnvironment()
  
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)
  const validSorts = ['hot', 'new', 'rising', 'top']
  const validTimes = ['hour', 'day', 'week', 'month', 'year', 'all']
  
  const finalSort = validSorts.includes(sort) ? sort : 'hot'
  const finalTime = validTimes.includes(time) ? time : 'day'
  
  // Prepare Apify input
  const apifyInput = {
    subreddit: subreddit === 'all' ? undefined : subreddit,
    sort: finalSort,
    time: finalTime,
    limit: validatedLimit,
    includeComments: false,
    scrollTimeout: 40,
  }
  
  try {
    console.log(`Fetching Reddit trending: ${subreddit}/${finalSort}/${finalTime} (limit: ${validatedLimit})`)
    
    // Run Apify actor
    const rawData = await runApifyActor(REDDIT_ACTOR_ID, apifyInput, {
      timeout: 45000 // 45 seconds
    })
    
    // Format the data
    const formattedPosts = formatRedditData(rawData)
    
    // Log usage
    logApiUsage('Reddit', 'trending', validatedLimit, formattedPosts.length, 0.01)
    
    return {
      platform: 'reddit',
      subreddit,
      sort: finalSort,
      time_period: finalTime,
      posts: formattedPosts,
      count: formattedPosts.length,
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('Reddit trending error:', error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      'Failed to fetch Reddit trending data',
      'REDDIT_FETCH_FAILED',
      error
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const subreddit = searchParams.get('subreddit') || 'all'
    const sort = searchParams.get('sort') || 'hot'
    const time = searchParams.get('time') || 'day'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get trending data
    const data = await withErrorHandling(getRedditTrending)(subreddit, sort, time, limit)
    
    return NextResponse.json(createSuccessResponse(data))
    
  } catch (error) {
    console.error('Reddit API route error:', error)
    
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