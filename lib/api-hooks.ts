import { useState, useEffect } from 'react'
import { ApiResponse, TrendingResponse, ContentGenerationResponse, UsageStats } from './types'

// ============================================================================
// API HOOKS
// ============================================================================

export function useTrendingData(
  platform: 'reddit' | 'twitter' | 'tiktok',
  params: Record<string, string | number> = {},
  autoFetch: boolean = true
) {
  const [data, setData] = useState<TrendingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value))
      })

      const response = await fetch(`/api/trending/${platform}?${queryParams}`)
      const result: ApiResponse<TrendingResponse> = await response.json()

      if (result.success) {
        setData(result.data || null)
      } else {
        setError(result.error || 'Failed to fetch trending data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [platform, JSON.stringify(params), autoFetch])

  return { data, loading, error, refetch: fetchData }
}

export function useRedditTrending(
  subreddit: string = 'all',
  sort: string = 'hot',
  time: string = 'day',
  limit: number = 10,
  autoFetch: boolean = true
) {
  return useTrendingData('reddit', { subreddit, sort, time, limit }, autoFetch)
}

export function useTwitterTrending(
  query: string = '', // Empty query triggers hashtag-based trending
  location: string = 'worldwide',
  limit: number = 10,
  autoFetch: boolean = true
) {
  return useTrendingData('twitter', { query, location, limit }, autoFetch)
}

export function useTikTokTrending(
  hashtag: string = '', // Empty hashtag triggers #fyp, #viral, #foryou
  query: string = '',
  limit: number = 10,
  autoFetch: boolean = true
) {
  return useTrendingData('tiktok', { hashtag, query, limit }, autoFetch)
}

export function useContentGeneration() {
  const [data, setData] = useState<ContentGenerationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (payload: {
    topic: string
    platform?: string
    format?: string
    target_audience?: string
    count?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result: ApiResponse<ContentGenerationResponse> = await response.json()

      if (result.success) {
        setData(result.data || null)
        return result.data
      } else {
        setError(result.error || 'Failed to generate content')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, generateContent }
}

export function useApiStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stats')
      const result: ApiResponse<UsageStats> = await response.json()

      if (result.success) {
        setStats(result.data || null)
      } else {
        setError(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatNumber(num: number | undefined | null): string {
  // Handle undefined, null, or non-numeric values
  if (num === undefined || num === null || isNaN(Number(num))) {
    return '0'
  }
  
  const numValue = Number(num)
  
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`
  }
  return numValue.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
}

// Settings-based API hooks for enhanced monitoring
export const useSettingsBasedRedditTrending = (autoFetch: boolean = true) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWithSettings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { buildRedditParams } = await import('@/lib/settings-utils')
      const params = buildRedditParams()
      
      const queryParams = new URLSearchParams({
        limit: '10',
        subreddits: params.subreddits.join(','),
        keywords: params.keywords.join(','),
        minUpvotes: params.minUpvotes.toString(),
        time: params.timeframe === '1h' ? 'hour' : params.timeframe === '24h' ? 'day' : params.timeframe === '7d' ? 'week' : 'month'
      })
      
      const response = await fetch(`/api/trending/reddit?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Reddit data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchWithSettings()
    }
  }, [autoFetch])

  return { data, loading, error, refetch: fetchWithSettings }
}

export const useSettingsBasedTwitterTrending = (autoFetch: boolean = true) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWithSettings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { buildTwitterParams } = await import('@/lib/settings-utils')
      const params = buildTwitterParams()
      
      // Fetch from multiple hashtags and accounts
      const allResults = []
      
      // Fetch searchTerms-based content
      for (const searchTerm of params.searchTerms.slice(0, 3)) {
        try {
          const queryParams = new URLSearchParams({
            query: searchTerm,
            location: 'worldwide',
            limit: '5'
          })
          
          const response = await fetch(`/api/trending/twitter?${queryParams}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data?.trends) {
              allResults.push(...result.data.trends)
            }
          }
        } catch (err) {
          console.error(`Failed to fetch search term ${searchTerm}:`, err)
        }
      }
      
      // Fetch account-based content
      for (const account of params.accounts.slice(0, 3)) {
        try {
          const queryParams = new URLSearchParams({
            query: `from:${account}`,
            location: 'worldwide',
            limit: '3'
          })
          
          const response = await fetch(`/api/trending/twitter?${queryParams}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data?.trends) {
              allResults.push(...result.data.trends)
            }
          }
        } catch (err) {
          console.error(`Failed to fetch account ${account}:`, err)
        }
      }
      
      // Filter by engagement and deduplicate
      const filteredResults = allResults
        .filter(tweet => (tweet.raw_likes + tweet.raw_retweets) >= params.minEngagement)
        .filter((tweet, index, arr) => arr.findIndex(t => t.tweet_id === tweet.tweet_id) === index)
        .sort((a, b) => (b.raw_likes + b.raw_retweets) - (a.raw_likes + a.raw_retweets))
        .slice(0, 10)
      
      setData({
        success: true,
        data: {
          platform: 'twitter',
          query: 'settings-based',
          trends: filteredResults,
          count: filteredResults.length,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Twitter data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchWithSettings()
    }
  }, [autoFetch])

  return { data, loading, error, refetch: fetchWithSettings }
}

export const useSettingsBasedTikTokTrending = (autoFetch: boolean = true) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWithSettings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { buildTikTokParams } = await import('@/lib/settings-utils')
      const params = buildTikTokParams()
      
      const allResults = []
      
      // Fetch from multiple hashtags
      for (const hashtag of params.hashtags.slice(0, 3)) {
        try {
          const queryParams = new URLSearchParams({
            hashtag: `#${hashtag}`,
            query: '',
            limit: '5'
          })
          
          const response = await fetch(`/api/trending/tiktok?${queryParams}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data?.trends) {
              allResults.push(...result.data.trends)
            }
          }
        } catch (err) {
          console.error(`Failed to fetch TikTok hashtag ${hashtag}:`, err)
        }
      }
      
      // Filter by views and deduplicate
      const filteredResults = allResults
        .filter(video => video.raw_views >= params.minViews)
        .filter((video, index, arr) => arr.findIndex(v => v.video_url === video.video_url) === index)
        .sort((a, b) => b.raw_views - a.raw_views)
        .slice(0, 10)
      
      setData({
        success: true,
        data: {
          platform: 'tiktok',
          query: 'settings-based',
          trends: filteredResults,
          count: filteredResults.length,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch TikTok data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchWithSettings()
    }
  }, [autoFetch])

  return { data, loading, error, refetch: fetchWithSettings }
} 