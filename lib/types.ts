// ============================================================================
// TRENDING TOPIC TYPES
// ============================================================================

export interface RedditPost {
  id: string
  title: string
  subreddit: string
  score: number
  num_comments: number
  created_utc: number
  url: string
  permalink: string
  author: string
  upvote_ratio: number
  selftext: string
  thumbnail?: string
  domain?: string
}

export interface TwitterTrend {
  name: string
  volume: number
  growth: string
  tweet_volume?: number
  url?: string
  promoted_content?: null
}

export interface TikTokTrend {
  title: string
  views: string
  likes: string
  growth: string
  hashtags?: string[]
  video_url?: string
  author?: string
  description?: string
}

export interface ContentIdea {
  format: string
  title: string
  description: string
  hook: string
  duration?: string
  word_count?: string
  engagement?: string
  tags: string[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface TrendingResponse {
  platform: 'reddit' | 'twitter' | 'tiktok'
  posts?: RedditPost[]
  trends?: TwitterTrend[] | TikTokTrend[]
  count: number
  timestamp: string
  query?: string
  subreddit?: string
  sort?: string
  time_period?: string
  location?: string
}

export interface ContentGenerationResponse {
  topic: string
  platform: string
  format: string
  target_audience: string
  ideas: ContentIdea[]
  count: number
  timestamp: string
}

export interface UsageStats {
  total_requests: number
  by_service: Record<string, number>
  by_endpoint: Record<string, number>
  uptime_seconds: number
  total_cost_estimate: number
  timestamp: string
}

// ============================================================================
// APIFY ACTOR TYPES
// ============================================================================

export interface ApifyRedditInput {
  subreddit?: string
  sort?: 'hot' | 'new' | 'rising' | 'top'
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  limit?: number
}

export interface ApifyTwitterInput {
  searchTerms?: string[]
  maxTweets?: number
  onlyVerified?: boolean
  excludeReplies?: boolean
  language?: string
}

export interface ApifyTikTokInput {
  hashtags?: string[]
  searchQueries?: string[]
  resultsPerPage?: number
  shouldDownloadVideos?: boolean
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export class TrendingApiError extends Error {
  public code: string
  public details?: any

  constructor(message: string, code: string = 'TRENDING_API_ERROR', details?: any) {
    super(message)
    this.name = 'TrendingApiError'
    this.code = code
    this.details = details
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Platform = 'reddit' | 'twitter' | 'tiktok'
export type ContentFormat = 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'blog' | 'mixed'
export type TargetAudience = 'content-creators' | 'marketers' | 'entrepreneurs' | 'general'
export type SortOrder = 'hot' | 'new' | 'rising' | 'top' | 'relevance'
export type TimeFrame = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' 