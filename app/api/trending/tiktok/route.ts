import { NextRequest, NextResponse } from 'next/server'
import { 
  runApifyActor, 
  formatTikTokData, 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  validateEnvironment,
  withErrorHandling
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError } from '@/lib/types'

const TIKTOK_ACTOR_ID = 'apify/tiktok-scraper'

async function getTikTokTrending(
  hashtag: string = '',
  query: string = '',
  limit: number = 10
): Promise<TrendingResponse> {
  // Validate environment
  validateEnvironment()
  
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)
  
  // Prepare Apify input for TikTok scraper
  const apifyInput = {
    hashtags: hashtag ? [hashtag] : [],
    searchQueries: query ? [query] : ['trending'],
    resultsPerPage: validatedLimit,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
  }
  
  try {
    console.log(`Fetching TikTok trending: hashtag="${hashtag}" query="${query}" (limit: ${validatedLimit})`)
    
    // Run Apify actor
    const rawData = await runApifyActor(TIKTOK_ACTOR_ID, apifyInput, {
      timeout: 60000 // 60 seconds for TikTok
    })
    
    // Format the data
    const formattedTrends = formatTikTokData(rawData)
    
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
    
    // Get trending data
    const data = await withErrorHandling(getTikTokTrending)(hashtag, query, limit)
    
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