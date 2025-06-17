"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TrendingUp, MessageCircle, Heart, Share, ExternalLink, RefreshCw, Loader2, AlertCircle, X, Sparkles, Settings, ChevronDown, Eye } from "lucide-react"
import { formatNumber, useContentGeneration } from "@/lib/api-hooks"
import { setLastScanTime, getLastScanTime, formatTimeAgo } from "@/lib/client-utils"
import { getMonitoringSettings, getTikTokRegionDisplay } from "@/lib/settings-utils"
import { useClientReddit } from "@/app/hooks/useClientReddit"
import Link from "next/link"
import { ContentIdea } from '@/lib/types'

// MatchBadges component - moved outside to avoid React rendering issues
interface MatchBadgesProps {
  post: {
    matchType?: string
    matchedSubreddit?: string
    matchedKeywords?: string[]
    matchedHashtags?: string[]
    matchedSearchTerms?: string[]
  }
}

const MatchBadges = ({ post }: MatchBadgesProps) => {
  const { 
    matchType, 
    matchedSubreddit, 
    matchedKeywords, 
    matchedHashtags,
    matchedSearchTerms
  } = post
  
  if (!matchType) {
    return null
  }
  
  return (
    <div className="flex items-center gap-1 mb-2">
      {/* Reddit subreddit matches */}
      {(matchType === 'subreddit' || matchType === 'both') && matchedSubreddit && (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
          📍 r/{matchedSubreddit}
        </Badge>
      )}
      
      {/* Twitter search term matches */}
      {(matchType === 'searchTerm' || matchType === 'both') && matchedSearchTerms && (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
          📍 {Array.isArray(matchedSearchTerms) ? matchedSearchTerms.slice(0, 2).join(', ') : matchedSearchTerms}
        </Badge>
      )}
      
      {/* TikTok hashtag matches */}
      {(matchType === 'hashtag' || matchType === 'both') && matchedHashtags && (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
          📍 #{Array.isArray(matchedHashtags) ? matchedHashtags.slice(0, 2).join(', #') : matchedHashtags}
        </Badge>
      )}
      
      {/* Keyword matches for all platforms */}
      {(matchType === 'keyword' || matchType === 'both') && matchedKeywords && (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
          🔍 {Array.isArray(matchedKeywords) ? matchedKeywords.slice(0, 2).join(', ') : matchedKeywords}
        </Badge>
      )}
      

    </div>
  )
}

export function TrendingTopics() {
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanTime, setLastScanTimeState] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date()) // For updating time display
  const [showSettings, setShowSettings] = useState(false)
  
  // Get current monitoring settings for display
  const currentSettings = getMonitoringSettings()
  
  // Load last scan time on component mount
  useEffect(() => {
    const saved = getLastScanTime()
    if (saved) {
      setLastScanTimeState(new Date(saved))
    }
  }, [])
  
  // Update current time every minute to refresh "time ago" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  // Get monitoring settings to determine which subreddit to use
  const settings = getMonitoringSettings()
  const primarySubreddit = settings.reddit.subreddits[0] || 'programming'
  
  // Use client-side Reddit hook to bypass server-side IP blocking
  const { 
    posts: redditPosts, 
    loading: redditLoading, 
    error: redditError 
  } = useClientReddit(primarySubreddit, 10)
  
  const [twitterData, setTwitterData] = useState<any>(null)
  const [twitterLoading, setTwitterLoading] = useState(false)
  const [twitterError, setTwitterError] = useState<string | null>(null)
  
  const [tiktokData, setTiktokData] = useState<any>(null)
  const [tiktokLoading, setTiktokLoading] = useState(false)
  const [tiktokError, setTiktokError] = useState<string | null>(null)
  
  const [instagramData, setInstagramData] = useState<any>(null)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [instagramError, setInstagramError] = useState<string | null>(null)
  
  // Manual refetch functions
  const refetchReddit = () => {
    // Client-side Reddit hook handles automatic refetching
    // This function exists for compatibility but hook handles the refresh
    setLastScanTime(new Date().toISOString())
    console.log('🔍 Reddit refetch requested - handled by client-side hook')
  }
  
  const refetchTwitter = async () => {
    setTwitterLoading(true)
    setTwitterError(null)
    try {
      const settings = getMonitoringSettings()
      const searchTerms = settings.twitter.searchTerms.join(',')
      const keywords = settings.reddit.keywords.join(',') // Use Reddit keywords for cross-platform matching
      const primarySearchTerm = settings.twitter.searchTerms[0] || 'trending'
      const response = await fetch(`/api/trending/twitter?query=${encodeURIComponent(primarySearchTerm)}&location=worldwide&limit=10&searchTerms=${encodeURIComponent(searchTerms)}&keywords=${encodeURIComponent(keywords)}`)
      const result = await response.json()
      console.log('🔍 Manual Twitter fetch result:', result)
      setTwitterData(result)
      setLastScanTime(new Date().toISOString())
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch Twitter data'
      setTwitterError(errorMsg)
      console.error('❌ Twitter fetch error:', error)
      throw error
    } finally {
      setTwitterLoading(false)
    }
  }
  
  const refetchTikTok = async () => {
    setTiktokLoading(true)
    setTiktokError(null)
    try {
      const settings = getMonitoringSettings()
      const hashtags = settings.tiktok.hashtags.join(',')
      const keywords = settings.reddit.keywords.join(',') // Use Reddit keywords for cross-platform matching
      const primaryHashtag = settings.tiktok.hashtags[0] || 'productivity'
      const response = await fetch(`/api/trending/tiktok?hashtag=%23${encodeURIComponent(primaryHashtag)}&query=&limit=10&hashtags=${encodeURIComponent(hashtags)}&keywords=${encodeURIComponent(keywords)}`)
      const result = await response.json()
      console.log('🔍 Manual TikTok fetch result:', result)
      setTiktokData(result)
      setLastScanTime(new Date().toISOString())
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch TikTok data'
      setTiktokError(errorMsg)
      console.error('❌ TikTok fetch error:', error)
      throw error
    } finally {
      setTiktokLoading(false)
    }
  }
  
  const refetchInstagram = async () => {
    setInstagramLoading(true)
    setInstagramError(null)
    try {
      const settings = getMonitoringSettings()
      const hashtags = settings.instagram.hashtags.join(',') // Use Instagram-specific hashtags
      const keywords = settings.instagram.hashtags.join(',') // Use Instagram hashtags as keywords  
      const primaryHashtag = settings.instagram.hashtags[0] || 'productivity'
      const response = await fetch(`/api/trending/instagram?hashtag=${encodeURIComponent(primaryHashtag)}&query=&limit=10&hashtags=${encodeURIComponent(hashtags)}&keywords=${encodeURIComponent(keywords)}`)
      const result = await response.json()
      console.log('🔍 Manual Instagram fetch result:', result)
      setInstagramData(result)
      setLastScanTime(new Date().toISOString())
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch Instagram data'
      setInstagramError(errorMsg)
      console.error('❌ Instagram fetch error:', error)
      throw error
    } finally {
      setInstagramLoading(false)
    }
  }

  // Content generation hook
  const { generateContent } = useContentGeneration()

  // Manual scan function to fetch all platform data
  const handleScan = async () => {
    setIsScanning(true)
    try {
      // Fetch all platforms simultaneously
      const results = await Promise.all([
        refetchReddit(),
        refetchTwitter(),
        refetchTikTok(),
        refetchInstagram()
      ])
      
      // Save scan timestamp
      const scanTime = new Date()
      setLastScanTimeState(scanTime)
      
    } catch (error) {
      console.error('❌ Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  // Handle clicking Generate Ideas - scroll to content generator
  const handleGenerateIdeas = (content: { 
    title: string; 
    fullText?: string; 
    description?: string; 
    selftext?: string; 
    text?: string;
    platform: string;
    url?: string;
  }) => {
    setSelectedTopic(content)
    
    // Create comprehensive topic data
    const topicData = {
      title: content.title,
      content: content.fullText || content.description || content.selftext || content.text || '',
      platform: content.platform,
      url: content.url,
      timestamp: new Date().toISOString()
    }
    
    // Find content generator component and dispatch custom event
    const contentGenerator = document.querySelector('[data-component="content-generator"]')
    if (contentGenerator) {
      const event = new CustomEvent('topicSelected', {
        detail: topicData,
        bubbles: true
      })
      contentGenerator.dispatchEvent(event)
    } else {
      // Fallback: dispatch on document
      const event = new CustomEvent('topicSelected', {
        detail: topicData,
        bubbles: true
      })
      document.dispatchEvent(event)
    }
  }

  const getEngagementColor = (score: number, platform: string = 'default') => {
    // Platform-specific thresholds for more accurate engagement classification
    const thresholds = {
      reddit: { viral: 1000, high: 500, medium: 100 },
      twitter: { viral: 5000, high: 1000, medium: 100 },
      tiktok: { viral: 10000, high: 5000, medium: 1000 },
      instagram: { viral: 10000, high: 5000, medium: 1000 },
      default: { viral: 1000, high: 500, medium: 100 }
    }
    
    const t = thresholds[platform as keyof typeof thresholds] || thresholds.default
    
    if (score > t.viral) return "bg-red-100 text-red-800" // Viral
    if (score > t.high) return "bg-orange-100 text-orange-800" // High
    if (score > t.medium) return "bg-yellow-100 text-yellow-800" // Medium
    return "bg-gray-100 text-gray-800" // Low
  }

  const getEngagementLabel = (score: number, platform: string = 'default') => {
    // Platform-specific thresholds for more accurate engagement classification
    const thresholds = {
      reddit: { viral: 1000, high: 500, medium: 100 },
      twitter: { viral: 5000, high: 1000, medium: 100 },
      tiktok: { viral: 10000, high: 5000, medium: 1000 },
      instagram: { viral: 10000, high: 5000, medium: 1000 },
      default: { viral: 1000, high: 500, medium: 100 }
    }
    
    const t = thresholds[platform as keyof typeof thresholds] || thresholds.default
    
    if (score > t.viral) return "Viral"
    if (score > t.high) return "High"
    if (score > t.medium) return "Medium"
    return "Low"
  }

  const LoadingState = ({ platform }: { platform: string }) => (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading {platform} trends...</span>
      </div>
    </div>
  )

  const ErrorState = ({ error, onRetry, platform }: { error: string, onRetry: () => void, platform: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <p className="text-sm text-muted-foreground mb-4">Failed to load {platform} trends</p>
      <p className="text-xs text-red-600 mb-4">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )

  const EmptyState = ({ platform }: { platform: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No {platform} data loaded</h3>
      <p className="text-sm text-gray-500 mb-4">Click "Scan" to discover trending topics</p>
      <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning}>
        <RefreshCw className="h-4 w-4 mr-2" />
        {isScanning ? 'Scanning...' : 'Scan Now'}
      </Button>
    </div>
  )

  // Build a set of trending hashtags for Instagram
  const trendingHashtagSet = new Set(
    instagramData?.data?.hashtags?.filter((h: any) => h.isTrending).map((h: any) => h.id)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending For You
        </CardTitle>
            {lastScanTime && (
              <p className="text-sm text-gray-500 mt-1">
                Last scan: {formatTimeAgo(lastScanTime.toISOString())}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configure
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showSettings ? 'Hide' : 'View'} Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              size="sm"
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>
        
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Monitoring Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-medium text-gray-700 mb-1">Reddit</p>
                <p><strong>Subreddits:</strong> {currentSettings.reddit.subreddits.slice(0, 3).join(', ')}</p>
                <p><strong>Keywords:</strong> {currentSettings.reddit.keywords.slice(0, 3).join(', ')}</p>
                <p><strong>Min Upvotes:</strong> {currentSettings.reddit.minUpvotes}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Twitter</p>
                <p><strong>Search Terms:</strong> {currentSettings.twitter.searchTerms.slice(0, 3).join(', ')}</p>
                <p><strong>Accounts:</strong> @{currentSettings.twitter.accounts.slice(0, 3).join(', @')}</p>
                <p><strong>Min Engagement:</strong> {formatNumber(currentSettings.twitter.minEngagement)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">TikTok</p>
                <p><strong>Hashtags:</strong> #{currentSettings.tiktok.hashtags.slice(0, 3).join(', #')}</p>
                <p><strong>Min Views:</strong> {formatNumber(currentSettings.tiktok.minViews)}</p>
                <p><strong>Region:</strong> {getTikTokRegionDisplay(currentSettings.tiktok.region)}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reddit" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reddit" className="relative">
              Reddit
              {redditLoading && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger value="twitter" className="relative">
              Twitter
              {twitterLoading && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="relative">
              TikTok
              {tiktokLoading && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger value="instagram" className="relative">
              Instagram
              {instagramLoading && <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reddit" className="space-y-4">
            {redditLoading ? (
              <LoadingState platform="Reddit" />
            ) : redditError ? (
              <ErrorState error={redditError} onRetry={refetchReddit} platform="Reddit" />
            ) : redditPosts && redditPosts.length > 0 ? (
              redditPosts.map((post: any) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {post.url ? (
                          <a 
                            href={post.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {post.title}
                          </a>
                        ) : (
                          <span>{post.title}</span>
                        )}
                      </h3>
                      {post.selftext && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.selftext}</p>
                      )}
                      <MatchBadges post={post} />
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">r/{post.subreddit}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                          {formatNumber(post.score)} upvotes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                          {formatNumber(post.num_comments)} comments
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(post.posted_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getEngagementColor(post.score, 'reddit')}>
                          {getEngagementLabel(post.score, 'reddit')}
                      </Badge>
                        {post.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={post.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleGenerateIdeas({ 
                        title: post.title, 
                        platform: 'reddit',
                        selftext: post.selftext,
                        url: post.url
                      })}
                    >
                    Generate Ideas
                  </Button>
                </div>
              </div>
              ))
            ) : (
              <EmptyState platform="Reddit" />
            )}
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4">
            {twitterLoading ? (
              <LoadingState platform="Twitter" />
            ) : twitterError ? (
              <ErrorState error={twitterError} onRetry={refetchTwitter} platform="Twitter" />
            ) : twitterData?.data?.trends && twitterData.data.trends.length > 0 ? (
              twitterData.data.trends.map((trend: any, index: number) => {
                return (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {trend.url ? (
                            <a 
                              href={trend.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {trend.name || trend.text || 'Twitter Trend'}
                            </a>
                          ) : (
                            <span>{trend.name || trend.text || 'Twitter Trend'}</span>
                          )}
                        </h3>
                        {trend.text && trend.name !== trend.text && (
                          <p className="text-sm text-gray-600 mb-2">{trend.text}</p>
                        )}
                        <MatchBadges post={trend} />
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">Twitter</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                            {formatNumber(trend.volume || 0)} interactions
                      </div>
                      <div className="flex items-center gap-1">
                        <Share className="h-4 w-4" />
                            {formatNumber(trend.tweet_volume || 0)} tweets
                      </div>
                      {trend.posted_date && (
                        <span className="text-xs text-gray-500">{formatTimeAgo(trend.posted_date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                          <Badge className={getEngagementColor(trend.retweets || trend.tweet_volume || 0, 'twitter')}>
                            {getEngagementLabel(trend.retweets || trend.tweet_volume || 0, 'twitter')}
                      </Badge>
                          {trend.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={trend.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                    </div>
                  </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateIdeas({ 
                          title: trend.name || trend.text || 'Twitter Trend', 
                          platform: 'twitter',
                          text: trend.text,
                          url: trend.url
                        })}
                      >
                    Generate Ideas
                  </Button>
                </div>
              </div>
                )
              })
            ) : (
              <EmptyState platform="Twitter" />
            )}
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-4">
            {tiktokLoading ? (
              <LoadingState platform="TikTok" />
            ) : tiktokError ? (
              <ErrorState error={tiktokError} onRetry={refetchTikTok} platform="TikTok" />
            ) : tiktokData?.data?.trends && tiktokData.data.trends.length > 0 ? (
              tiktokData.data.trends.map((trend: any, index: number) => {
                return (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {trend.video_url ? (
                            <a 
                              href={trend.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {trend.title || 'TikTok Trend'}
                            </a>
                          ) : (
                            <span>{trend.title || 'TikTok Trend'}</span>
                          )}
                        </h3>
                        {trend.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{trend.description}</p>
                        )}
                        <MatchBadges post={trend} />
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {trend.author && (
                            <span className="font-medium">@{trend.author}</span>
                          )}
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                            {trend.views || '0'} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                            {trend.likes || '0'} likes
                      </div>
                      {trend.posted_date && (
                        <span className="text-xs text-gray-500">{formatTimeAgo(trend.posted_date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                          <Badge className={getEngagementColor(Number(trend.likes) || 0, 'tiktok')}>
                            {getEngagementLabel(Number(trend.likes) || 0, 'tiktok')}
                      </Badge>
                          {trend.video_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={trend.video_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                    </div>
                  </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateIdeas({ 
                          title: trend.title || 'TikTok Trend', 
                          platform: 'tiktok',
                          description: trend.description,
                          url: trend.video_url
                        })}
                      >
                    Generate Ideas
                  </Button>
                </div>
              </div>
                )
              })
            ) : (
              <EmptyState platform="TikTok" />
            )}
          </TabsContent>

          <TabsContent value="instagram" className="space-y-4">
            {instagramLoading ? (
              <LoadingState platform="Instagram" />
            ) : instagramError ? (
              <ErrorState error={instagramError} onRetry={refetchInstagram} platform="Instagram" />
            ) : instagramData?.data?.media && instagramData.data.media.length > 0 ? (
              instagramData.data.media.map((post: any, index: number) => {
                return (
                  <div key={index} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${post.is_fallback ? 'border-blue-200 bg-blue-50' : ''}`}>
                    {post.is_fallback && (
                      <div className="mb-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          📋 Real Cached Posts - API Unavailable
                        </Badge>
                      </div>
                    )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {post.permalink ? (
                            <a 
                              href={post.permalink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              @{post.username} - {post.media_type.toLowerCase()}
                            </a>
                          ) : (
                            <span>@{post.username} - {post.media_type.toLowerCase()}</span>
                          )}
                        </h3>
                        {post.caption && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{post.caption}</p>
                        )}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.hashtags.slice(0, 3).map((hashtag: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                #{hashtag.replace(/^#/, '')}
                                {trendingHashtagSet.has(hashtag.replace(/^#/, '')) && (
                                  <span role="img" aria-label="Trending">🔥</span>
                                )}
                              </Badge>
                            ))}
                            {post.hashtags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.hashtags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">@{post.username}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                            {formatNumber(post.like_count)} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                            {formatNumber(post.comments_count)} comments
                      </div>
                      {post.hashtag && (
                        <Badge variant="secondary" className="text-xs text-blue-700 bg-blue-100 border-blue-300">
                          #{post.hashtag}
                        </Badge>
                      )}
                      {post.posted_date && (
                        <span className="text-xs text-gray-500">{formatTimeAgo(post.posted_date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                          <Badge className={getEngagementColor(post.like_count || 0, 'instagram')}>
                            {getEngagementLabel(post.like_count || 0, 'instagram')}
                      </Badge>
                          {post.permalink && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                    </div>
                  </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateIdeas({ 
                          title: `@${post.username} - ${post.media_type.toLowerCase()}`, 
                          platform: 'instagram',
                          description: post.caption,
                          url: post.permalink
                        })}
                      >
                    Generate Ideas
                  </Button>
                </div>
              </div>
                )
              })
            ) : (
              <EmptyState platform="Instagram" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
