import { NextRequest, NextResponse } from 'next/server'
import { TrendingResponse, InstagramPost } from '@/lib/types'
import { getEngagementLabel, getEngagementColor, runApifyActor } from '@/lib/api-utils'

// ====== CONFIGURATION ======
// DEPLOYMENT SIGNATURE: 2025-01-20-CACHE-BUST-v3
// CRITICAL: NO FILE SYSTEM OPERATIONS - VERCEL READ-ONLY
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
    engagement_level: 'Low',
    engagement_color: '#6b7280',
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
  console.log(`[Instagram] GET handler called: ${request.url}`)
  
  // NO FILE OPERATIONS - CONSOLE LOGGING ONLY
  try {
    const { searchParams } = new URL(request.url)
    const hashtag = searchParams.get('hashtag') || 'productivity'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)
    
    if (!APIFY_TOKEN) {
      console.log('[Instagram] No APIFY_TOKEN, falling back to demo data')
      return NextResponse.json({
        success: true,
        data: DEMO_INSTAGRAM_POSTS.slice(0, limit),
        count: Math.min(DEMO_INSTAGRAM_POSTS.length, limit),
        timestamp: new Date().toISOString()
      })
    }
    
    const input = {
      hashtags: [hashtag],
      resultsLimit: 50
    }
    
    const { posts } = await fetchFromApify(
      APIFY_INSTAGRAM_HASHTAG_ACTOR,
      input,
      limit,
      hashtag
    )
    
    if (posts.length === 0) {
      console.log('[Instagram] No posts found, returning demo data')
      return NextResponse.json({
        success: true,
        data: DEMO_INSTAGRAM_POSTS.slice(0, limit),
        count: Math.min(DEMO_INSTAGRAM_POSTS.length, limit),
        timestamp: new Date().toISOString()
      })
    }
    
         const response: TrendingResponse = {
       platform: 'instagram',
       media: posts,
       count: posts.length,
       timestamp: new Date().toISOString(),
       hashtag: hashtag
     }
    
         return NextResponse.json({ success: true, data: response })
    
  } catch (error) {
    console.error('[Instagram] Error in GET handler:', error)
    
    // NO FILE OPERATIONS - FALLBACK TO DEMO
    console.log('[Instagram] Falling back to DEMO_INSTAGRAM_POSTS')
    return NextResponse.json({
      success: true,
      data: DEMO_INSTAGRAM_POSTS.slice(0, 3),
      count: Math.min(DEMO_INSTAGRAM_POSTS.length, 3),
      timestamp: new Date().toISOString()
    })
  }
} 