"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, MessageCircle, Heart, Share, ExternalLink, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { useRedditTrending, useTwitterTrending, useTikTokTrending, formatTimeAgo, formatNumber } from "@/lib/api-hooks"

export function TrendingTopics() {
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  
  // API hooks for each platform
  const { 
    data: redditData, 
    loading: redditLoading, 
    error: redditError, 
    refetch: refetchReddit 
  } = useRedditTrending('all', 'hot', 'day', 10)
  
  const { 
    data: twitterData, 
    loading: twitterLoading, 
    error: twitterError, 
    refetch: refetchTwitter 
  } = useTwitterTrending('', 'worldwide', 10)
  
  const { 
    data: tiktokData, 
    loading: tiktokLoading, 
    error: tiktokError, 
    refetch: refetchTikTok 
  } = useTikTokTrending('', 'trending', 10)

  const getEngagementColor = (score: number) => {
    if (score > 1000) return "bg-red-100 text-red-800" // Viral
    if (score > 500) return "bg-orange-100 text-orange-800" // High
    if (score > 100) return "bg-yellow-100 text-yellow-800" // Medium
    return "bg-gray-100 text-gray-800" // Low
  }

  const getEngagementLabel = (score: number) => {
    if (score > 1000) return "Viral"
    if (score > 500) return "High"
    if (score > 100) return "Medium"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reddit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          <TabsContent value="reddit" className="space-y-4">
            {redditLoading ? (
              <LoadingState platform="Reddit" />
            ) : redditError ? (
              <ErrorState error={redditError} onRetry={refetchReddit} platform="Reddit" />
            ) : redditData?.posts && redditData.posts.length > 0 ? (
              redditData.posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      {post.selftext && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.selftext}</p>
                      )}
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
                        <span className="text-xs">
                          {formatTimeAgo(new Date(post.created_utc * 1000).toISOString())}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {post.upvote_ratio * 100}% upvoted
                        </Badge>
                        <Badge className={getEngagementColor(post.score)}>
                          {getEngagementLabel(post.score)}
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
                      onClick={() => setSelectedTopic({ title: post.title, platform: 'reddit' })}
                    >
                      Generate Ideas
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No Reddit trends available</p>
                <Button variant="outline" size="sm" onClick={refetchReddit} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4">
            {twitterLoading ? (
              <LoadingState platform="Twitter" />
            ) : twitterError ? (
              <ErrorState error={twitterError} onRetry={refetchTwitter} platform="Twitter" />
            ) : twitterData?.trends && twitterData.trends.length > 0 ? (
              twitterData.trends.map((trend, index) => {
                // Type guard to ensure we're working with TwitterTrend
                const twitterTrend = trend as any
                return (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{twitterTrend.name || 'Twitter Trend'}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {formatNumber(twitterTrend.volume || 0)} interactions
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-4 w-4" />
                            {formatNumber(twitterTrend.tweet_volume || 0)} tweets
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {twitterTrend.growth || '+0%'} growth
                          </Badge>
                          <Badge className={getEngagementColor(twitterTrend.volume || 0)}>
                            {getEngagementLabel(twitterTrend.volume || 0)}
                          </Badge>
                          {twitterTrend.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={twitterTrend.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedTopic({ title: twitterTrend.name || 'Twitter Trend', platform: 'twitter' })}
                      >
                        Generate Ideas
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No Twitter trends available</p>
                <Button variant="outline" size="sm" onClick={refetchTwitter} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-4">
            {tiktokLoading ? (
              <LoadingState platform="TikTok" />
            ) : tiktokError ? (
              <ErrorState error={tiktokError} onRetry={refetchTikTok} platform="TikTok" />
            ) : tiktokData?.trends && tiktokData.trends.length > 0 ? (
              tiktokData.trends.map((trend, index) => {
                // Type guard to ensure we're working with TikTokTrend
                const tiktokTrend = trend as any
                return (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{tiktokTrend.title || 'TikTok Trend'}</h3>
                        {tiktokTrend.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tiktokTrend.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-4 w-4" />
                            {tiktokTrend.views || '0'} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {tiktokTrend.likes || '0'} likes
                          </div>
                          {tiktokTrend.author && (
                            <span className="font-medium">@{tiktokTrend.author}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {tiktokTrend.growth || '+0%'} growth
                          </Badge>
                          <Badge className={getEngagementColor(parseInt((tiktokTrend.views || '0').replace(/[^0-9]/g, '')) || 0)}>
                            {getEngagementLabel(parseInt((tiktokTrend.views || '0').replace(/[^0-9]/g, '')) || 0)}
                          </Badge>
                          {tiktokTrend.video_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={tiktokTrend.video_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedTopic({ title: tiktokTrend.title || 'TikTok Trend', platform: 'tiktok' })}
                      >
                        Generate Ideas
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No TikTok trends available</p>
                <Button variant="outline" size="sm" onClick={refetchTikTok} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
