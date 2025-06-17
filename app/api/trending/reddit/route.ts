import { NextRequest, NextResponse } from 'next/server'
import { validateLimit, getEngagementLabel, getEngagementColor } from '@/lib/api-utils'

class TrendingApiError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'TrendingApiError'
  }
}

interface RedditPost {
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

interface TrendingResponse {
  platform: string
  subreddit?: string
  sort?: string
  time_period?: string
  posts: RedditPost[]
  count: number
  timestamp: string
}

// Reddit OAuth2 token cache
let redditToken: { access_token: string; expires_at: number } | null = null

/**
 * Get Reddit OAuth2 access token using client credentials
 */
async function getRedditAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (redditToken && redditToken.expires_at > Date.now()) {
    return redditToken.access_token
  }

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new TrendingApiError('Reddit API credentials not configured', 'CONFIG_ERROR')
  }

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TrendingTopicTracker/1.0 (by /u/TrendingBot)'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`OAuth2 failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the token with expiration (Reddit tokens last 1 hour)
    redditToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 minute early
    }

    return data.access_token
  } catch (error) {
    console.error('Reddit OAuth2 error:', error)
    throw new TrendingApiError('Failed to authenticate with Reddit API', 'AUTH_ERROR')
  }
}

/**
 * Make authenticated request to Reddit OAuth2 API
 */
async function makeRedditRequest(
  endpoint: string,
  params?: Record<string, any>,
  timeout: number = 10000
): Promise<any> {
  try {
    const accessToken = await getRedditAccessToken()
    
    const url = new URL(`https://oauth.reddit.com${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'TrendingTopicTracker/1.0 (by /u/TrendingBot)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TrendingApiError('Request timeout', 'TIMEOUT')
    }
    throw error
  }
}

/**
 * Format Reddit OAuth2 API response to internal format
 */
function formatRedditData(posts: any[]): RedditPost[] {
  return posts
    .filter((post) => post.data && post.data.title && !post.data.stickied)
    .map((post) => {
      const data = post.data
      const score = data.score || data.ups || 0
      const num_comments = data.num_comments || 0
      const created_utc = data.created_utc || 0

      const mapped: RedditPost = {
        id: data.id || '',
        title: data.title || '',
        subreddit: data.subreddit || '',
        score,
        num_comments,
        created_utc,
        url: data.url || '',
        permalink: data.permalink ? `https://reddit.com${data.permalink}` : '',
        author: data.author || '',
        upvote_ratio: data.upvote_ratio || 0,
        selftext: data.selftext || '',
        thumbnail: data.thumbnail,
        domain: data.domain,
        engagement_level: getEngagementLabel(score, 'reddit'),
        engagement_color: getEngagementColor(score, 'reddit'),
        posted_date: created_utc ? new Date(created_utc * 1000).toISOString() : new Date().toISOString(),
      }
      return mapped
    })
    .sort((a, b) => b.score - a.score)
}

async function getRedditTrending(
  subreddit: string = 'all',
  sort: string = 'hot',
  time: string = 'day',
  limit: number = 10,
  subredditList?: string[],
  keywords?: string[],
  minUpvotes?: number
): Promise<TrendingResponse> {
  // Validate and sanitize inputs
  const validatedLimit = validateLimit(limit, 50)
  const validSorts = ['hot', 'new', 'rising', 'top']
  const validTimes = ['hour', 'day', 'week', 'month', 'year', 'all']
  
  const finalSort = validSorts.includes(sort) ? sort : 'hot'
  const finalTime = validTimes.includes(time) ? time : 'day'
  
  let allPosts: any[] = []
  
  try {
    // Combine all posts and add match metadata
    const allPostsWithMatches = []
    
    // If no specific settings provided, use the basic subreddit request
    if (!subredditList && !keywords) {
      try {
        const endpoint = `/r/${subreddit}/${finalSort}`
        const params: Record<string, any> = {
          limit: validatedLimit
        }
        if (finalSort === 'top') {
          params.t = finalTime
        }

        const subredditPosts = await makeRedditRequest(endpoint, params)
        if (subredditPosts?.data?.children) {
          const postsWithMatch = subredditPosts.data.children.map((post: any) => ({
            ...post,
            matchType: 'subreddit',
            matchedSubreddit: subreddit
          }))
          allPostsWithMatches.push(...postsWithMatch)
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error)
      }
    }
    
    // Get posts from target subreddits
    if (subredditList && subredditList.length > 0) {
      for (const targetSubreddit of subredditList) {
        try {
          const endpoint = `/r/${targetSubreddit}/${finalSort}`
          const params: Record<string, any> = {
            limit: 25
          }
          if (finalSort === 'top') {
            params.t = finalTime
          }

          const subredditPosts = await makeRedditRequest(endpoint, params)
          if (subredditPosts?.data?.children) {
            // Add subreddit match metadata
            const postsWithMatch = subredditPosts.data.children.map((post: any) => ({
              ...post,
              matchType: 'subreddit',
              matchedSubreddit: targetSubreddit
            }))
            allPostsWithMatches.push(...postsWithMatch)
          }
        } catch (error) {
          console.error(`Error fetching from r/${targetSubreddit}:`, error)
        }
      }
    }
    
    // Get posts from all subreddits for keyword matching
    if (keywords && keywords.length > 0) {
      try {
        const endpoint = `/r/all/${finalSort}`
        const params: Record<string, any> = {
          limit: 100
        }
        if (finalSort === 'top') {
          params.t = finalTime
        }

        const allPosts = await makeRedditRequest(endpoint, params)
        if (allPosts?.data?.children) {
          // Filter by keywords and add keyword match metadata
          const keywordPosts = allPosts.data.children.filter((post: any) => {
            const searchText = (post.data.title + ' ' + post.data.selftext).toLowerCase()
            const matchedKeywords = []
            
            // Only check for full phrase matches (no individual word fallback)
            for (const keywordPhrase of keywords) {
              const phrase = keywordPhrase.toLowerCase().trim()
              if (phrase.length > 2 && searchText.includes(phrase)) {
                matchedKeywords.push(keywordPhrase) // Keep original casing for display
              }
            }
            
            if (matchedKeywords.length > 0) {
              post.matchType = 'keyword'
              post.matchedKeywords = matchedKeywords
              return true
            }
            return false
          })
          
          if (keywordPosts.length > 0) {
            allPostsWithMatches.push(...keywordPosts.slice(0, limit))
          }
        }
      } catch (error) {
        console.error('Error fetching keyword posts from r/all:', error)
      }
    }
    
    // Remove duplicates and merge match types
    const uniquePosts: any[] = []
    const seenIds = new Set()
    
    for (const post of allPostsWithMatches) {
      const postData = post.data || post
      if (seenIds.has(postData.id)) {
        // Post already exists, merge match types
        const existingPost = uniquePosts.find((p: any) => (p.data || p).id === postData.id)
        if (existingPost) {
          if (post.matchType === 'subreddit' && existingPost.matchType === 'keyword') {
            existingPost.matchType = 'both'
          } else if (post.matchType === 'keyword' && existingPost.matchType === 'subreddit') {
            existingPost.matchType = 'both'
          }
        }
      } else {
        seenIds.add(postData.id)
        uniquePosts.push(post)
      }
    }
    
    // Apply minimum upvotes filter if specified
    let filteredPosts = uniquePosts
    if (minUpvotes && minUpvotes > 0) {
      filteredPosts = uniquePosts.filter((post) => {
        const postData = post.data || post
        return (postData.score || postData.ups || 0) >= minUpvotes
      })
    }
    
    // Convert to children format and sort by score
    const children = filteredPosts.map(post => post.data ? post : { data: post })
    const formattedPosts = formatRedditData(children.slice(0, validatedLimit))
    
    return {
      platform: 'reddit',
      subreddit,
      sort: finalSort,
      time_period: finalTime,
      posts: formattedPosts,
      count: formattedPosts.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Reddit API error:', error)
    return {
      platform: 'reddit',
      subreddit,
      sort: finalSort,
      time_period: finalTime,
      posts: [],
      count: 0,
      timestamp: new Date().toISOString()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const subreddit = searchParams.get('subreddit') || 'all'
    const sort = searchParams.get('sort') || 'hot'
    const time = searchParams.get('time') || 'day'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Parse JSON arrays if provided
    const subredditList = searchParams.get('subreddits') 
      ? JSON.parse(searchParams.get('subreddits')!) 
      : undefined
    const keywords = searchParams.get('keywords') 
      ? JSON.parse(searchParams.get('keywords')!) 
      : undefined
    const minUpvotes = searchParams.get('minUpvotes')
      ? parseInt(searchParams.get('minUpvotes')!)
      : undefined

    console.log(`[Reddit] trending: processing request for r/${subreddit}`)

    const result = await getRedditTrending(
      subreddit,
      sort,
      time,
      limit,
      subredditList,
      keywords,
      minUpvotes
    )

    console.log(`[Reddit] trending: ${result.count}/${limit} items (est. $${(result.count * 0.0001).toFixed(4)})`)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Reddit] API Error:', error)
    
    if (error instanceof TrendingApiError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      }, { status: error.code === 'TIMEOUT' ? 408 : 500 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 