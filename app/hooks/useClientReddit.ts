import { useState, useEffect, useCallback } from 'react'

interface RedditPost {
  id: string
  title: string
  subreddit: string
  score: number
  num_comments: number
  url: string
  permalink: string
  author: string
  upvote_ratio: number
  posted_date: string
  selftext?: string
}

export function useClientReddit(subreddit: string, limit: number = 10) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchRedditData = useCallback(async () => {
    if (!subreddit) return

    setLoading(true)
    setError(null)
    
    try {
      // Try direct Reddit API first
      let response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&t=${Date.now()}`,
        {
          headers: {
            'User-Agent': 'TrendingTopicTracker/1.0'
          }
        }
      )

      // If CORS fails (common on localhost), try with CORS proxy
      if (!response.ok && response.status === 0) {
        console.log('Direct Reddit call failed, trying CORS proxy...')
        response = await fetch(
          `https://corsproxy.io/?https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&t=${Date.now()}`,
          {
            headers: {
              'User-Agent': 'TrendingTopicTracker/1.0'
            }
          }
        )
      }

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.data?.children) {
        const formattedPosts: RedditPost[] = data.data.children
          .filter((post: any) => post.data && !post.data.stickied)
          .map((post: any) => ({
            id: post.data.id,
            title: post.data.title,
            subreddit: post.data.subreddit,
            score: post.data.score || 0,
            num_comments: post.data.num_comments || 0,
            url: post.data.url,
            permalink: `https://reddit.com${post.data.permalink}`,
            author: post.data.author,
            upvote_ratio: post.data.upvote_ratio || 0,
            posted_date: new Date(post.data.created_utc * 1000).toISOString(),
            selftext: post.data.selftext || undefined
          }))
          .sort((a: RedditPost, b: RedditPost) => b.score - a.score)

        setPosts(formattedPosts)
        console.log(`🔍 Reddit client-side fetch completed: ${formattedPosts.length} posts from r/${subreddit}`)
      } else {
        setPosts([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Reddit data')
      setPosts([])
      console.error('❌ Reddit client-side fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [subreddit, limit, refreshTrigger])

  useEffect(() => {
    fetchRedditData()
  }, [fetchRedditData])

  // Manual refresh function that can be called from outside
  const refresh = useCallback(() => {
    console.log('🔍 Manual Reddit refresh triggered')
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return { posts, loading, error, refresh }
} 