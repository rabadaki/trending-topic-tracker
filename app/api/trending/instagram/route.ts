import { NextRequest, NextResponse } from 'next/server'
import { TrendingResponse, InstagramPost } from '@/lib/types'
import { getEngagementLabel, getEngagementColor, runApifyActor } from '@/lib/api-utils'

// ====== CONFIGURATION ======
// Build timestamp: 2025-01-20T20:15:00Z - Enhanced error logging for production debugging - FORCE DEPLOY
// NO FILE SYSTEM OPERATIONS - VERCEL READ-ONLY ENVIRONMENT
const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const APIFY_INSTAGRAM_HASHTAG_ACTOR = 'apify/instagram-scraper'
const APIFY_INSTAGRAM_PROFILE_ACTOR = 'apify/instagram-profile-scraper'

// ====== DEMO FALLBACK DATA ======
const DEMO_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'demo1',
    caption: 'Demo post: Productivity tips!',
    media_url: 'https://instagram.com/p/demo1',
    permalink: 'https://instagram.com/p/demo1',
    media_type: 'IMAGE',
    like_count: 123,
    comments_count: 45,
    username: 'demo_user',
    hashtags: ['productivity', 'demo'],
    engagement_level: 'Low' as const,
    engagement_color: '#6b7280' as const,
    raw_engagement: 168,
    posted_date: new Date(Date.now() - 3600000).toISOString()
  }
]

// ====== INTERFACES ======
interface ApifyInstagramHashtag {
  allPosts?: Array<{
    id: string
    caption?: string
    url?: string
    displayUrl?: string
    type?: string
    likesCount?: number
    commentsCount?: number
    ownerUsername?: string
    timestamp?: string
    hashtags?: string[]
  }>
}

// ====== CORE FETCH FUNCTION ======
async function fetchFromApify(actorId: string, input: any, limit: number, searchQuery: string): Promise<{ posts: InstagramPost[], hashtags: ApifyInstagramHashtag[] }> {
  console.log(`[Instagram] About to call Apify for query: ${searchQuery}`)
  
  // CRITICAL: NO FILE OPERATIONS - ALL LOGGING TO CONSOLE ONLY
  const timeout = 60 * 1000
  const runRes = await runApifyActor(actorId, input, { timeout })
  const items: ApifyInstagramHashtag[] = runRes
  
  console.log(`[Instagram] Apify response status: success`)
  console.log(`[Instagram] Apify raw items count: ${Array.isArray(items) ? items.length : 'not array'}`)
  
  // Extract all posts
  let allPosts: any[] = []
  for (const item of items) {
    if (item.allPosts && Array.isArray(item.allPosts)) {
      allPosts.push(...item.allPosts)
    }
  }
  
  console.log(`[Instagram] Extracted allPosts count: ${allPosts.length}`)
  
  // Filter recent posts (last 48 hours)
  const cutoffTime = Date.now() - (48 * 60 * 60 * 1000)
  const recentPosts = allPosts.filter(post => {
    if (!post.timestamp) return false
    const postTime = new Date(post.timestamp).getTime()
    return postTime > cutoffTime
  })
  
  console.log(`[Instagram] Recent posts (last 48h) count: ${recentPosts.length}`)
  
  // Trending algorithm: prioritize by engagement
  const trendingPosts = recentPosts
    .filter(post => post.likesCount && post.likesCount > 50)
    .sort((a, b) => {
      const aEngagement = (a.likesCount || 0) + (a.commentsCount || 0) * 5
      const bEngagement = (b.likesCount || 0) + (b.commentsCount || 0) * 5
      return bEngagement - aEngagement
    })
    .slice(0, limit * 2)
  
  console.log(`[Instagram] Shortlisted trending posts count: ${trendingPosts.length}`)
  
  // Map to our format
  const mappedPosts: InstagramPost[] = trendingPosts
    .slice(0, limit)
    .map(post => {
      const likes = post.likesCount || 0
      const comments = post.commentsCount || 0
      const engagement = likes + (comments * 5)
      
             const mapped: InstagramPost = {
         id: post.id || `unknown-${Date.now()}`,
         caption: (post.caption || '').substring(0, 200),
         media_url: post.displayUrl || post.url || '',
         permalink: post.url || `https://instagram.com/p/${post.id}`,
         media_type: (post.type === 'Video' ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
         like_count: likes,
         comments_count: comments,
         username: post.ownerUsername || 'unknown',
         hashtags: post.hashtags || [],
         engagement_level: getEngagementLabel(engagement, 'instagram'),
         engagement_color: getEngagementColor(engagement, 'instagram'),
         raw_engagement: engagement,
         posted_date: post.timestamp || new Date().toISOString()
       }
      
      console.log(`[Instagram] Mapped post: ${JSON.stringify(mapped).substring(0, 200)}...`)
      return mapped
    })
  
  console.log(`[Instagram] Final posts returned count: ${mappedPosts.length}`)
  
  return {
    posts: mappedPosts,
    hashtags: items
  }
}

// ====== API HANDLER ======
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('[Instagram] =================================')
  console.log('[Instagram] NEW REQUEST STARTED')
  console.log('[Instagram] URL:', request.url)
  console.log('[Instagram] Environment check:')
  console.log('[Instagram] - NODE_ENV:', process.env.NODE_ENV)
  console.log('[Instagram] - VERCEL:', process.env.VERCEL)
  console.log('[Instagram] - APIFY_TOKEN exists:', !!APIFY_TOKEN)
  console.log('[Instagram] - APIFY_TOKEN length:', APIFY_TOKEN?.length || 0)
  
  try {
    const { searchParams } = new URL(request.url)
    const hashtag = searchParams.get('hashtag') || 'productivity'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('[Instagram] Parsed params:')
    console.log('[Instagram] - hashtag:', hashtag)
    console.log('[Instagram] - limit:', limit)

    if (!APIFY_TOKEN) {
      console.error('[Instagram] CRITICAL ERROR: APIFY_API_TOKEN is missing!')
      console.log('[Instagram] Available env vars:', Object.keys(process.env).filter(k => k.includes('APIFY')))
      throw new Error('APIFY_API_TOKEN environment variable is not set')
    }

    console.log('[Instagram] About to call runApifyActor with:')
    console.log('[Instagram] - actor:', APIFY_INSTAGRAM_HASHTAG_ACTOR)
    console.log('[Instagram] - query:', hashtag)
    console.log('[Instagram] - token length:', APIFY_TOKEN.length)

    const apifyItems = await runApifyActor(
      APIFY_INSTAGRAM_HASHTAG_ACTOR,
      { hashtag, resultsLimit: Math.min(limit * 10, 100) },
      { timeout: 60000 }
    )
    
    console.log('[Instagram] Apify result received:')
    console.log('[Instagram] - Items count:', apifyItems?.length || 0)
    console.log('[Instagram] - Items type:', typeof apifyItems)
    console.log('[Instagram] - Is array:', Array.isArray(apifyItems))

    if (!apifyItems || !Array.isArray(apifyItems) || apifyItems.length === 0) {
      console.warn('[Instagram] No items returned from Apify')
      throw new Error('No Instagram posts found from Apify')
    }

    console.log('[Instagram] Processing Apify data...')
    const posts: InstagramPost[] = []
    
    for (let i = 0; i < apifyItems.length && posts.length < limit; i++) {
      const post = apifyItems[i]
      console.log(`[Instagram] Processing post ${i + 1}:`, {
        id: post.id,
        caption: post.caption?.substring(0, 50),
        likes: post.likesCount,
        comments: post.commentsCount
      })
      
      try {
        const likes = post.likesCount || post.likes || 0
        const comments = post.commentsCount || post.comments || 0
        const engagement = likes + comments
        
        const mappedPost: InstagramPost = {
          id: post.id || `unknown-${Date.now()}-${i}`,
          caption: (post.caption || '').substring(0, 200),
          media_url: post.displayUrl || post.url || '',
          permalink: post.url || `https://instagram.com/p/${post.id}`,
          media_type: (post.type === 'Video' ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
          like_count: likes,
          comments_count: comments,
          username: post.ownerUsername || 'unknown',
          hashtags: post.hashtags || [],
          engagement_level: getEngagementLabel(engagement, 'instagram'),
          engagement_color: getEngagementColor(engagement, 'instagram'),
          raw_engagement: engagement,
          posted_date: post.timestamp || new Date().toISOString()
        }
        
        posts.push(mappedPost)
        console.log(`[Instagram] Successfully mapped post ${i + 1}`)
      } catch (mappingError) {
        console.error(`[Instagram] Error mapping post ${i + 1}:`, mappingError)
        continue
      }
    }

    console.log(`[Instagram] Successfully processed ${posts.length} posts`)
    
    if (posts.length === 0) {
      throw new Error('Failed to process any Instagram posts from Apify data')
    }

    const response = {
      platform: 'instagram',
      media: posts,
      count: posts.length,
      timestamp: new Date().toISOString(),
      hashtag: hashtag
    }

    const duration = Date.now() - startTime
    console.log(`[Instagram] SUCCESS: Returning ${posts.length} real posts in ${duration}ms`)
    console.log('[Instagram] =================================')
    
    return NextResponse.json({ success: true, data: response })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    console.error('[Instagram] =================================')
    console.error('[Instagram] ERROR CAUGHT - FALLING BACK TO DEMO DATA')
    console.error('[Instagram] Error type:', error?.constructor?.name)
    console.error('[Instagram] Error message:', errorMsg)
    console.error('[Instagram] Error stack:', errorStack)
    console.error('[Instagram] Duration before error:', duration + 'ms')
    console.error('[Instagram] =================================')

    // Return demo data as fallback
    const response = {
      platform: 'instagram',
      media: DEMO_INSTAGRAM_POSTS,
      count: DEMO_INSTAGRAM_POSTS.length,
      timestamp: new Date().toISOString(),
      hashtag: 'demo'
    }

    console.log('[Instagram] Returning demo data due to error')
    return NextResponse.json({ success: true, data: response })
  }
} 