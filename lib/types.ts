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
  engagement_level: string
  engagement_color: string
  posted_date: string
}

export interface TwitterTrend {
  name: string
  volume: number
  tweet_volume?: number
  url?: string
  engagement_level: string
  engagement_color: string
  promoted_content?: null
  posted_date: string
}

export interface TikTokTrend {
  title: string
  views: string
  likes: string
  hashtags?: string[]
  video_url?: string
  author?: string
  description?: string
  engagement_level: string
  engagement_color: string
  raw_views: number
  raw_likes: number
  posted_date: string
}

// InstagramPost interface moved to API response types section below

export interface ContentIdea {
  format: string
  title: string
  description: string
  hook: string
  duration?: string
  word_count?: string
  engagement?: string
  tags: string[]
  // New streamlined prompt fields
  content_type?: string
  engagement_strategy?: string
  // Platform-specific optimization fields
  thumbnail_concept?: string
  seo_keywords?: string[]
  visual_concept?: string
  trend_element?: string
  tweet_count?: string
  thread_structure?: string
  format_type?: string
  hashtag_strategy?: string
  seo_strategy?: string
  content_structure?: string
  platform_adaptations?: string
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

export interface InstagramPost {
  id: string
  caption: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  permalink: string
  timestamp?: string
  like_count: number
  comments_count: number
  hashtags?: string[]
  username: string
  engagement_level: string
  engagement_color: string
  raw_engagement: number
  posted_date: string
}

export interface TrendingResponse {
  platform: 'reddit' | 'twitter' | 'tiktok' | 'instagram'
  posts?: RedditPost[]
  trends?: TwitterTrend[] | TikTokTrend[]
  media?: InstagramPost[]
  count: number
  timestamp: string
  query?: string
  subreddit?: string
  sort?: string
  time_period?: string
  location?: string
  hashtag?: string
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

/**
 * Type for Apify Twitter post response item
 */
export interface ApifyTwitterPost {
  id?: string;
  text?: string;
  createdAt?: string;
  timestamp_ms?: string;
  created_at?: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  favoriteCount?: number;
  user?: {
    screen_name?: string;
    name?: string;
    followers_count?: number;
  };
  author?: {
    username?: string;
    name?: string;
  };
  hashtags?: string[];
  url?: string;
  permalink?: string;
  isRetweet?: boolean;
  isReply?: boolean;
}

/**
 * Type for Apify TikTok post response item
 */
export interface ApifyTikTokPost {
  id?: string;
  text?: string;
  description?: string;
  title?: string;
  createTime?: number;
  timestamp?: string;
  playCount?: number;
  diggCount?: number;
  shareCount?: number;
  commentCount?: number;
  webVideoUrl?: string;
  playAddr?: string;
  authorMeta?: {
    name?: string;
    nickname?: string;
    id?: string;
  };
  author?: string;
  hashtags?: Array<{
    name?: string;
    id?: string;
  }>;
  musicMeta?: {
    musicName?: string;
    musicAuthor?: string;
  };
  covers?: string[];
  videoMeta?: {
    width?: number;
    height?: number;
    duration?: number;
  };
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