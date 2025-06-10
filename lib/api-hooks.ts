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
  query: string = '',
  location: string = 'worldwide',
  limit: number = 10,
  autoFetch: boolean = true
) {
  return useTrendingData('twitter', { query, location, limit }, autoFetch)
}

export function useTikTokTrending(
  hashtag: string = '',
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

export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
} 