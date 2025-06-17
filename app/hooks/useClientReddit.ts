import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (!subreddit) return

    const fetchRedditData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Use Reddit's public JSON endpoints (no auth required, user's IP)
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
          {
            headers: {
              'User-Agent': 'TrendingTopicTracker/1.0'
            }
          }
        )

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
        } else {
          setPosts([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Reddit data')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRedditData()
  }, [subreddit, limit])

  return { posts, loading, error }
} 