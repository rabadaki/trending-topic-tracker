import { NextRequest, NextResponse } from 'next/server'
import { TrendingResponse, InstagramPost } from '@/lib/types'
import { getEngagementLabel, getEngagementColor, runApifyActor } from '@/lib/api-utils'

// ====== CONFIGURATION ======
// Updated: Removed all file system logging to fix Vercel production issues
const APIFY_TOKEN = process.env.APIFY_API_TOKEN // <-- Set this in your .env.local
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
    timestamp: new Date().toISOString(),
    like_count: 123,
    comments_count: 4,
    username: 'demo_user',
    raw_engagement: 127,
    engagement_level: getEngagementLabel(127, 'instagram'),
    engagement_color: getEngagementColor(127, 'instagram'),
    posted_date: new Date().toISOString(),
  },
]

/**
 * Type for Apify Instagram hashtag or profile response item
 */
interface ApifyInstagramPost {
  id?: string;
  url?: string;
  permalink?: string;
  caption?: string;
  displayUrl?: string;
  image?: string;
  mediaUrl?: string;
  type?: string;
  mediaType?: string;
  timestamp?: string;
  date?: string;
  likesCount?: number;
  likeCount?: number;
  commentsCount?: number;
  commentCount?: number;
  ownerUsername?: string;
  username?: string;
  hashtag?: string;
}

interface ApifyInstagramHashtag {
  id: string;
  topPosts?: ApifyInstagramPost[];
  latestPosts?: ApifyInstagramPost[];
}

/**
 * Fetches Instagram posts from Apify for a given actor and input.
 * Handles both hashtag and user profile queries.
 * Filters, sorts, and maps posts to internal format.
 */
async function fetchFromApify(actorId: string, input: any, limit: number, searchQuery: string): Promise<{ posts: InstagramPost[], hashtags: ApifyInstagramHashtag[] }> {
  // Use the same working Apify pattern as Twitter/TikTok
  const timeout = 60 * 1000; // 60 seconds
  const runRes = await runApifyActor(actorId, input, { timeout })
  const items: ApifyInstagramHashtag[] = runRes
  
  console.log(`[Instagram] Apify response status: success`)
  console.log(`[Instagram] Apify raw items count: ${Array.isArray(items) ? items.length : 'not array'}`)
  // 1. Extract all nested posts from all hashtags
  const allPosts: ApifyInstagramPost[] = []
  
  if (Array.isArray(items) && items.length > 0) {
    const firstItem = items[0];
    
    // Check if this is nested hashtag structure (search-based)
    if (firstItem.topPosts || firstItem.latestPosts) {
      // Nested structure from search-based approach
      for (const hashtagObj of items) {
        if (Array.isArray(hashtagObj.topPosts)) {
          allPosts.push(...hashtagObj.topPosts.map((post) => ({ ...post, hashtag: hashtagObj.id })))
        }
        if (Array.isArray(hashtagObj.latestPosts)) {
          allPosts.push(...hashtagObj.latestPosts.map((post) => ({ ...post, hashtag: hashtagObj.id })))
        }
      }
    } else {
      // Direct posts structure (directUrls approach)
      allPosts.push(...items.map((post) => ({ ...post, hashtag: searchQuery })))
    }
  }
  
  console.log(`[Instagram] Extracted allPosts count: ${allPosts.length}`)
  // 2. Shortlist trending posts (recent + high engagement)
  const now = Date.now()
  const recentPosts = allPosts.filter(post => {
    const postTime = new Date(post.timestamp || post.date || '').getTime()
    return (now - postTime) < 48 * 60 * 60 * 1000 // last 48h
  })
  console.log(`[Instagram] Recent posts (last 48h) count: ${recentPosts.length}`)
  recentPosts.forEach(post => {
    // Calculate engagement as likes + comments
    (post as any).engagement = (post.likesCount || post.likeCount || 0) + (post.commentsCount || post.commentCount || 0)
  })
  const sorted = recentPosts.sort((a: any, b: any) => b.engagement - a.engagement)
  // Use top 50% of recent posts or requested limit, whichever is smaller
  const top50pctIndex = Math.ceil(sorted.length * 0.5)
  const maxTrending = Math.min(top50pctIndex, limit * 2) // At least double the requested limit
  const shortlisted = sorted.slice(0, maxTrending)
  console.log(`[Instagram] Shortlisted trending posts count: ${shortlisted.length}`)
  // 3. Calculate trending hashtags by recent post count (last 24h)
  const hashtagsWithTrending = items.map((h) => {
    const posts = [...(h.topPosts || []), ...(h.latestPosts || [])]
    const postsLast24h = posts.filter((p) => (now - new Date(p.timestamp || p.date || '').getTime()) < 24 * 60 * 60 * 1000).length
    return { ...h, postsLast24h }
  })
  // Sort hashtags by postsLast24h and mark top 3 as trending
  const sortedHashtags = hashtagsWithTrending.sort((a, b) => b.postsLast24h - a.postsLast24h)
  const trendingHashtagIds = new Set(sortedHashtags.slice(0, 3).map((h) => h.id))
  const hashtagsFinal = hashtagsWithTrending.map((h) => ({ ...h, isTrending: trendingHashtagIds.has(h.id) }))
  // 4. Map posts to InstagramPost type (limit to requested number)
  const posts = shortlisted.slice(0, limit).map((item: ApifyInstagramPost) => {
    const like_count = item.likesCount || item.likeCount || 0
    const comments_count = item.commentsCount || item.commentCount || 0
    const raw_engagement = like_count + comments_count
    // Ensure hashtags is always an array
    const hashtags = item.hashtag ? [item.hashtag] : []
    // Ensure date parsing is safe
    const dateStr = item.timestamp || item.date
    /**
     * Map ApifyInstagramPost to internal InstagramPost type
     */
    const mapped: InstagramPost = {
      id: item.id || item.url || item.permalink || '',
      caption: item.caption || '',
      media_url: item.displayUrl || item.image || item.mediaUrl || '',
      permalink: item.url || item.permalink || '',
      media_type: (item.type || item.mediaType || 'IMAGE').toUpperCase() as any,
      timestamp: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
      like_count,
      comments_count,
      username: item.ownerUsername || item.username || '',
      raw_engagement,
      engagement_level: getEngagementLabel(raw_engagement, 'instagram'),
      engagement_color: getEngagementColor(raw_engagement, 'instagram'),
      hashtags,
      posted_date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
    }
    console.log(`[Instagram] Mapped post: ${JSON.stringify(mapped).substring(0, 300)}...`)
    return mapped
  })
  console.log(`[Instagram] Final posts returned count: ${posts.length}`)
  return { posts, hashtags: hashtagsFinal }
}

// ====== MAIN API ROUTE ======
export async function GET(req: NextRequest) {
  process.stdout.write(`[Instagram] GET handler called: ${req.url}\n`)
  console.log('[Instagram] GET handler called:', req.url)
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('hashtag') || searchParams.get('query') || ''
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  if (!query) {
    process.stdout.write('[Instagram] Missing query param\n')
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }
  let posts: InstagramPost[] = []
  let hashtags: ApifyInstagramHashtag[] = []

  try {
    process.stdout.write(`[Instagram] About to call Apify for query: ${query}\n`)
    let apifyInput
    let actorId = APIFY_INSTAGRAM_HASHTAG_ACTOR
    if (query.startsWith('@')) {
      // User profile search
      const username = query.replace('@', '')
      apifyInput = {
        search: username,
        searchType: 'user',
        searchLimit: 5,
        resultsType: 'posts',
        resultsLimit: limit,
        addParentData: false,
        enhanceUserSearchWithFacebookPage: false,
        isUserReelFeedURL: false,
        isUserTaggedFeedURL: false
      }
    } else {
      // Hashtag search - revert to search-based with limits
      const hashtag = query.replace('#', '')
      apifyInput = {
        search: hashtag,
        searchType: 'hashtag',
        resultsType: 'posts',
        resultsLimit: 10, // Fixed cap to prevent timeouts
        searchLimit: 1,
        addParentData: false
      }
    }
    const result = await fetchFromApify(actorId, apifyInput, limit, query)
    posts = result.posts
    hashtags = result.hashtags
    if (!posts.length) throw new Error('No posts found')
  } catch (e) {
    process.stdout.write(`[Instagram] Error in GET handler: ${e}\n`)
    console.error('[Instagram] Error in GET handler:', e)
    process.stdout.write('[Instagram] Falling back to DEMO_INSTAGRAM_POSTS\n')
    console.warn('[Instagram] Falling back to DEMO_INSTAGRAM_POSTS')
    posts = DEMO_INSTAGRAM_POSTS.slice(0, limit)
  }

  const response: TrendingResponse = {
    platform: 'instagram',
    hashtag: query,
    media: posts,
    count: posts.length,
    timestamp: new Date().toISOString(),
    query,
  }
  return NextResponse.json({ success: true, data: response })
} 