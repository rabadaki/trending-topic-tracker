import { ApifyClient } from 'apify-client'
import { TrendingApiError, ApiResponse } from './types'

// Export TrendingApiError for use in other modules
export { TrendingApiError }

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateEnvironment(): void {
  if (!process.env.APIFY_API_TOKEN) {
    throw new TrendingApiError(
      'APIFY_API_TOKEN environment variable is required',
      'MISSING_API_TOKEN'
    )
  }
}

export function validateLimit(limit: number, max: number = 50): number {
  if (isNaN(limit) || limit < 1) {
    return 10 // Default
  }
  return Math.min(limit, max)
}

// ============================================================================
// ENGAGEMENT CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates engagement level based on platform-specific thresholds
 */
export function getEngagementLabel(value: number, platform: string): string {
  const thresholds = {
    reddit: { viral: 5000, high: 500, medium: 50 },
    twitter: { viral: 10000, high: 1000, medium: 100 },
    tiktok: { viral: 1000000, high: 100000, medium: 10000 },
    instagram: { viral: 50000, high: 5000, medium: 500 }
  }
  
  const platformThresholds = thresholds[platform as keyof typeof thresholds]
  if (!platformThresholds) return 'Low'
  
  if (value >= platformThresholds.viral) return 'Viral'
  if (value >= platformThresholds.high) return 'High'
  if (value >= platformThresholds.medium) return 'Medium'
  return 'Low'
}

/**
 * Returns color code for engagement level
 */
export function getEngagementColor(value: number, platform: string): string {
  const level = getEngagementLabel(value, platform)
  const colors = {
    'Viral': '#ff4444',
    'High': '#ff8800',
    'Medium': '#ffaa00',
    'Low': '#888888'
  }
  return colors[level as keyof typeof colors] || '#888888'
}

/**
 * Formats large numbers with K/M/B suffixes
 */
export function formatEngagementNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// ============================================================================
// APIFY HELPER FUNCTIONS
// ============================================================================

/**
 * Runs an Apify actor and returns the dataset items
 * @param actorId - The Apify actor ID
 * @param input - Input parameters for the actor
 * @param options - Additional options like timeout
 * @returns Promise<any[]> - Array of dataset items
 */
export async function runApifyActor(
  actorId: string,
  input: Record<string, unknown>,
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
// ERROR HANDLING WRAPPER
// ============================================================================

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
// RESPONSE HELPERS
// ============================================================================

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(message: string): ApiResponse {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

// Usage tracking (in memory for now - could be moved to Redis later)
const apiUsage = {
  total_requests: 0,
  by_service: {} as Record<string, number>,
  by_endpoint: {} as Record<string, number>,
  start_time: new Date(),
  total_cost_estimate: 0.0,
}

export function logApiUsage(
  platform: string,
  endpoint: string,
  requested: number,
  returned: number,
  estimatedCost: number
): void {
  // Update usage stats
  apiUsage.total_requests += 1
  
  if (!apiUsage.by_service[platform]) {
    apiUsage.by_service[platform] = 0
  }
  apiUsage.by_service[platform] += 1
  
  const endpointKey = `${platform}_${endpoint}`
  if (!apiUsage.by_endpoint[endpointKey]) {
    apiUsage.by_endpoint[endpointKey] = 0
  }
  apiUsage.by_endpoint[endpointKey] += 1
  
  if (estimatedCost) {
    apiUsage.total_cost_estimate += estimatedCost
  }
  
  console.log(`[${platform}] ${endpoint}: ${returned}/${requested} items (est. $${estimatedCost.toFixed(4)})`)
}

export function getApiUsageStats() {
  const uptime = new Date().getTime() - apiUsage.start_time.getTime()
  return {
    ...apiUsage,
    uptime_seconds: Math.floor(uptime / 1000),
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// LEGACY FORMAT FUNCTIONS (DEPRECATED - Use typed functions in route files)
// ============================================================================

/**
 * @deprecated Use typed formatting in individual route files instead
 */
export function formatRedditData(rawData: any[]): any[] {
  console.warn('formatRedditData is deprecated - use typed formatting in route files')
  return rawData
}

/**
 * @deprecated Use typed formatting in individual route files instead
 */
export function formatTwitterData(rawData: any[]): any[] {
  console.warn('formatTwitterData is deprecated - use typed formatting in route files')
  return rawData
}

/**
 * @deprecated Use typed formatting in individual route files instead
 */
export function formatTikTokData(rawData: any[]): any[] {
  console.warn('formatTikTokData is deprecated - use typed formatting in route files')
  return rawData
} 