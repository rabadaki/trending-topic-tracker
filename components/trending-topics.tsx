"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, MessageCircle, Heart, Share, ExternalLink } from "lucide-react"

const trendingData = {
  reddit: [
    {
      id: 1,
      title: "AI Tools for Content Creation",
      subreddit: "r/artificial",
      upvotes: 2847,
      comments: 312,
      growth: "+156%",
      timeframe: "24h",
      engagement: "High",
    },
    {
      id: 2,
      title: "Remote Work Productivity Hacks",
      subreddit: "r/productivity",
      upvotes: 1923,
      comments: 189,
      growth: "+89%",
      timeframe: "24h",
      engagement: "Medium",
    },
    {
      id: 3,
      title: "Sustainable Living Tips",
      subreddit: "r/ZeroWaste",
      upvotes: 1456,
      comments: 234,
      growth: "+67%",
      timeframe: "24h",
      engagement: "High",
    },
  ],
  twitter: [
    {
      id: 4,
      title: "#AIRevolution",
      tweets: 45672,
      retweets: 12890,
      likes: 89234,
      growth: "+234%",
      timeframe: "24h",
      engagement: "Viral",
    },
    {
      id: 5,
      title: "#CreatorEconomy",
      tweets: 23451,
      retweets: 8934,
      likes: 45678,
      growth: "+123%",
      timeframe: "24h",
      engagement: "High",
    },
    {
      id: 6,
      title: "#TechTrends2025",
      tweets: 18923,
      retweets: 5678,
      likes: 34567,
      growth: "+98%",
      timeframe: "24h",
      engagement: "Medium",
    },
  ],
  tiktok: [
    {
      id: 7,
      title: "Morning Routine Optimization",
      views: "2.3M",
      likes: "456K",
      shares: "89K",
      growth: "+189%",
      timeframe: "24h",
      engagement: "Viral",
    },
    {
      id: 8,
      title: "Budget-Friendly Home Decor",
      views: "1.8M",
      likes: "234K",
      shares: "67K",
      growth: "+145%",
      timeframe: "24h",
      engagement: "High",
    },
    {
      id: 9,
      title: "Quick Healthy Recipes",
      views: "1.2M",
      likes: "189K",
      shares: "45K",
      growth: "+112%",
      timeframe: "24h",
      engagement: "High",
    },
  ],
}

export function TrendingTopics() {
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Viral":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
            <TabsTrigger value="reddit">Reddit</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          </TabsList>

          <TabsContent value="reddit" className="space-y-4">
            {trendingData.reddit.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{topic.subreddit}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {topic.upvotes} upvotes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {topic.comments} comments
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {topic.growth} growth
                      </Badge>
                      <Badge className={getEngagementColor(topic.engagement)}>{topic.engagement}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTopic(topic)}>
                    Generate Ideas
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4">
            {trendingData.twitter.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {topic.tweets} tweets
                      </div>
                      <div className="flex items-center gap-1">
                        <Share className="h-4 w-4" />
                        {topic.retweets} retweets
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {topic.likes} likes
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {topic.growth} growth
                      </Badge>
                      <Badge className={getEngagementColor(topic.engagement)}>{topic.engagement}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTopic(topic)}>
                    Generate Ideas
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-4">
            {trendingData.tiktok.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        {topic.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {topic.likes} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <Share className="h-4 w-4" />
                        {topic.shares} shares
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {topic.growth} growth
                      </Badge>
                      <Badge className={getEngagementColor(topic.engagement)}>{topic.engagement}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTopic(topic)}>
                    Generate Ideas
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
