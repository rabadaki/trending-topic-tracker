import { NextRequest, NextResponse } from 'next/server'
import { 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  getEngagementLabel,
  getEngagementColor
} from '@/lib/api-utils'
import { TrendingResponse, TrendingApiError, RedditPost } from '@/lib/types'

async function makeRequest(
  url: string,
  params?: Record<string, any>,
  headers?: Record<string, string>,
  timeout: number = 10000
): Promise<any> {
  try {
    const urlWithParams = new URL(url)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlWithParams.searchParams.append(key, String(value))
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(urlWithParams.toString(), {
      headers: {
        'User-Agent': 'TrendingTopicTracker/1.0 (by /u/TrendingBot)',
        ...headers
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
 * Type for Apify Reddit post response item
 */
interface ApifyRedditPost {
  id?: string;
  title?: string;
  subreddit?: string;
  score?: number;
  ups?: number;
  numberOfComments?: number;
  numComments?: number;
  createdAt?: string | number;
  created_utc?: number;
  url?: string;
  permalink?: string;
  author?: string;
  upvoteRatio?: number;
  selftext?: string;
  text?: string;
  thumbnail?: string;
  domain?: string;
  stickied?: boolean;
}

/**
 * Formats raw Apify Reddit data into internal RedditPost type.
 * Filters out stickied posts, sorts by score, and maps fields.
 */
function formatRedditData(posts: ApifyRedditPost[]): RedditPost[] {
  return posts
    .filter((post) => post.title && !post.stickied)
    .map((post) => {
      // Calculate engagement and ensure all fields are present
      const score = post.score || post.ups || 0
      const num_comments = post.numberOfComments || post.numComments || 0
      const created_utc = post.created_utc || (typeof post.createdAt === 'number' ? post.createdAt : (post.createdAt ? Math.floor(new Date(post.createdAt).getTime() / 1000) : 0))
      const mapped: RedditPost = {
        id: post.id || '',
        title: post.title || '',
        subreddit: post.subreddit || '',
        score,
        num_comments,
        created_utc,
        url: post.url || '',
        permalink: post.permalink || `https://reddit.com${post.url}`,
        author: post.author || '',
        upvote_ratio: post.upvoteRatio || 0,
        selftext: post.selftext || post.text || '',
        thumbnail: post.thumbnail,
        domain: post.domain,
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
        const subredditPosts = await makeRequest(`https://www.reddit.com/r/${subreddit}.json`, {
          limit: validatedLimit,
          sort: finalSort,
          t: finalTime
        })
        if (subredditPosts?.data?.children) {
          const postsWithMatch = subredditPosts.data.children.map((post: any) => ({
            ...post.data,
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
      for (const subreddit of subredditList) {
        try {
          const subredditPosts = await makeRequest(`https://www.reddit.com/r/${subreddit}.json`, {
            limit: 25,
            sort: finalSort,
            t: finalTime
          })
          if (subredditPosts?.data?.children) {
            // Add subreddit match metadata
            const postsWithMatch = subredditPosts.data.children.map((post: any) => ({
              ...post.data,
              matchType: 'subreddit',
              matchedSubreddit: subreddit
            }))
            allPostsWithMatches.push(...postsWithMatch)
          }
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error)
        }
      }
    }
    
    // Get posts from all subreddits for keyword matching
    if (keywords && keywords.length > 0) {
      try {
        const allPosts = await makeRequest('https://www.reddit.com/r/all.json', {
          limit: 100,
          sort: finalSort,
          t: finalTime
        })
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
              post.data.matchType = 'keyword'
              post.data.matchedKeywords = matchedKeywords
              return true
            }
            return false
          }).map((post: any) => post.data) // Extract the data object
          
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
      if (seenIds.has(post.id)) {
        // Post already exists, merge match types
        const existingPost = uniquePosts.find((p: any) => p.id === post.id)
        if (existingPost) {
          if (post.matchType === 'subreddit' && existingPost.matchType === 'keyword') {
            existingPost.matchType = 'both'
            existingPost.matchedSubreddit = post.matchedSubreddit
          } else if (post.matchType === 'keyword' && existingPost.matchType === 'subreddit') {
            existingPost.matchType = 'both'
            existingPost.matchedKeywords = post.matchedKeywords
          }
        }
      } else {
        seenIds.add(post.id)
        
        // Check if this post should have 'both' type immediately
        if (subredditList && keywords && 
            subredditList.some(sub => post.subreddit === sub) && 
            post.matchedKeywords && post.matchedKeywords.length > 0) {
          post.matchType = 'both'
          post.matchedSubreddit = post.subreddit
        }
        
        uniquePosts.push(post)
      }
    }

    // Format the data
    let formattedPosts = formatRedditData(uniquePosts)

    // Apply upvote filtering
    if (minUpvotes && minUpvotes > 0) {
      const originalCount = formattedPosts.length
      formattedPosts = formattedPosts.filter(post => post.score >= minUpvotes)
      
      // If upvote filtering results in zero posts, use lower threshold
      if (formattedPosts.length === 0 && originalCount > 0) {
        console.log(`minUpvotes ${minUpvotes} returned 0 results, trying ${Math.floor(minUpvotes * 0.1)}`)
        formattedPosts = formatRedditData(uniquePosts).filter(post => post.score >= Math.floor(minUpvotes * 0.1))
        
        if (formattedPosts.length === 0) {
          console.log(`Fallback: returning all posts without upvote filtering`)
          formattedPosts = formatRedditData(uniquePosts)
        }
      }
    }
    
    // Sort by score and limit results
    formattedPosts = formattedPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, validatedLimit)
    
    // Log usage (Reddit API is free)
    logApiUsage('Reddit', 'trending', validatedLimit, formattedPosts.length, 0)
    
    return {
      platform: 'reddit',
      subreddit: subredditList ? subredditList.join(',') : subreddit,
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
      `Failed to fetch Reddit trending data: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    
    // Settings-based parameters
    const subredditsParam = searchParams.get('subreddits')
    const keywordsParam = searchParams.get('keywords')
    const minUpvotes = searchParams.get('minUpvotes') ? parseInt(searchParams.get('minUpvotes')!) : undefined
    
    const subredditList = subredditsParam ? subredditsParam.split(',').slice(0, 3) : undefined
    const keywords = keywordsParam ? keywordsParam.split(',').slice(0, 3) : undefined
    
    // Get trending data
    const data = await withErrorHandling(getRedditTrending)(
      subreddit, 
      sort, 
      time, 
      limit,
      subredditList,
      keywords,
      minUpvotes
    )
    
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