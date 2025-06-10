import { ApifyApi } from 'apify-client'
import { TrendingApiError, ApiResponse } from './types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const apifyClient = new ApifyApi({
  token: process.env.APIFY_API_TOKEN,
})

// Usage tracking (in memory for now - could be moved to Redis later)
const apiUsage = {
  total_requests: 0,
  by_service: {} as Record<string, number>,
  by_endpoint: {} as Record<string, number>,
  start_time: new Date(),
  total_cost_estimate: 0.0,
}

// Rate limiting constants
export const MAX_LIMIT = 50
export const DEFAULT_LIMIT = 10
export const DEFAULT_TIMEOUT = 30000 // 30 seconds

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function validateLimit(limit: number, max: number = MAX_LIMIT): number {
  if (limit < 1) return 1
  if (limit > max) return max
  return limit
}

export function logApiUsage(
  service: string,
  endpoint: string,
  requestedLimit: number,
  actualResults?: number,
  costEstimate?: number
): void {
  apiUsage.total_requests += 1
  
  if (!apiUsage.by_service[service]) {
    apiUsage.by_service[service] = 0
  }
  apiUsage.by_service[service] += 1
  
  const endpointKey = `${service}_${endpoint}`
  if (!apiUsage.by_endpoint[endpointKey]) {
    apiUsage.by_endpoint[endpointKey] = 0
  }
  apiUsage.by_endpoint[endpointKey] += 1
  
  if (costEstimate) {
    apiUsage.total_cost_estimate += costEstimate
  }
  
  console.log(`API Usage: ${service}.${endpoint} | Requested: ${requestedLimit} | Results: ${actualResults} | Cost: $${costEstimate || 0}`)
}

export function getApiUsageStats() {
  const uptime = new Date().getTime() - apiUsage.start_time.getTime()
  return {
    ...apiUsage,
    uptime_seconds: Math.floor(uptime / 1000),
    timestamp: new Date().toISOString(),
  }
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(
  error: string | Error,
  code: string = 'API_ERROR'
): ApiResponse {
  const errorMessage = error instanceof Error ? error.message : error
  return {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// APIFY HELPER FUNCTIONS
// ============================================================================

export async function runApifyActor(
  actorId: string,
  input: any,
  options: { timeout?: number } = {}
): Promise<any[]> {
  const { timeout = DEFAULT_TIMEOUT } = options
  
  try {
    console.log(`Running Apify actor: ${actorId}`)
    
    const run = await apifyClient.actor(actorId).call(input, {
      timeout,
    })
    
    if (!run.defaultDatasetId) {
      throw new TrendingApiError('No dataset returned from Apify actor', 'APIFY_NO_DATASET')
    }
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
    
    console.log(`Apify actor ${actorId} returned ${items.length} items`)
    return items || []
    
  } catch (error) {
    console.error(`Apify actor ${actorId} failed:`, error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      `Failed to run Apify actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'APIFY_ACTOR_FAILED',
      { actorId, input }
    )
  }
}

// ============================================================================
// REDDIT HELPERS
// ============================================================================

export function formatRedditData(rawData: any[]): any[] {
  return rawData.map((item) => ({
    id: item.id || item.postId,
    title: item.title,
    subreddit: item.subreddit,
    score: item.score || item.ups || 0,
    num_comments: item.numberOfComments || item.numComments || 0,
    created_utc: item.createdAt ? new Date(item.createdAt).getTime() / 1000 : 0,
    url: item.url,
    permalink: item.permalink || `https://reddit.com${item.url}`,
    author: item.author,
    upvote_ratio: item.upvoteRatio || 0,
    selftext: item.selftext || item.text || '',
    thumbnail: item.thumbnail,
    domain: item.domain,
  }))
}

// ============================================================================
// TWITTER HELPERS
// ============================================================================

export function formatTwitterData(rawData: any[]): any[] {
  return rawData.map((item) => ({
    name: item.hashtag || item.trend || item.text,
    volume: item.tweetVolume || item.volume || 0,
    growth: item.growth || '+0%',
    tweet_volume: item.tweetVolume,
    url: item.url,
  }))
}

// ============================================================================
// TIKTOK HELPERS
// ============================================================================

export function formatTikTokData(rawData: any[]): any[] {
  return rawData.map((item) => ({
    title: item.text || item.description || item.title,
    views: item.playCount ? formatNumber(item.playCount) : '0',
    likes: item.diggCount ? formatNumber(item.diggCount) : '0',
    growth: item.growth || '+0%',
    hashtags: item.hashtags || [],
    video_url: item.webVideoUrl || item.playAddr,
    author: item.authorMeta?.name || item.author,
    description: item.text || item.description,
  }))
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof TrendingApiError) {
        throw error
      }
      
      console.error('Unexpected error:', error)
      throw new TrendingApiError(
        'An unexpected error occurred',
        'UNEXPECTED_ERROR',
        error
      )
    }
  }
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

export function validateEnvironment(): void {
  const required = ['APIFY_API_TOKEN']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new TrendingApiError(
      `Missing required environment variables: ${missing.join(', ')}`,
      'MISSING_ENV_VARS'
    )
  }
} 