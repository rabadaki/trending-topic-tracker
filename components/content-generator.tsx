"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, Download, RefreshCw } from "lucide-react"
import { ContentIdea } from '@/lib/types'

const contentIdeas = [
  {
    id: 1,
    format: "YouTube Video",
    title: "5 AI Tools That Will Transform Your Content Creation Workflow",
    description:
      "Create a comprehensive tutorial showcasing the top AI tools for content creators, including demonstrations and real-world use cases.",
    hook: "Start with a before/after comparison of content creation time",
    duration: "8-12 minutes",
    tags: ["AI", "Productivity", "Tutorial"],
  },
  {
    id: 2,
    format: "TikTok Series",
    title: "AI Tool of the Day Challenge",
    description: "Daily 60-second videos featuring one AI tool, its key benefit, and a quick demo.",
    hook: "Begin each video with 'This AI tool will save you X hours'",
    duration: "60 seconds",
    tags: ["AI", "Quick Tips", "Series"],
  },
  {
    id: 3,
    format: "Twitter Thread",
    title: "10 AI Tools Every Creator Should Know in 2025",
    description: "Detailed thread breaking down essential AI tools with specific use cases and pricing information.",
    hook: "Start with a bold claim about productivity gains",
    engagement: "Include polls and questions",
    tags: ["AI", "Tools", "Thread"],
  },
  {
    id: 4,
    format: "Instagram Reel",
    title: "AI vs Human: Content Creation Speed Test",
    description: "Side-by-side comparison showing content creation with and without AI assistance.",
    hook: "Split screen showing timer countdown",
    duration: "30 seconds",
    tags: ["AI", "Comparison", "Visual"],
  },
  {
    id: 5,
    format: "Blog Post",
    title: "The Complete Guide to AI-Powered Content Creation",
    description: "In-depth article covering AI tools, workflows, best practices, and future trends.",
    hook: "Start with surprising statistics about AI adoption",
    wordCount: "2000-3000 words",
    tags: ["AI", "Guide", "Long-form"],
  },
]

const targetAudiences = [
  'Content Creators',
  'Digital Marketers', 
  'Entrepreneurs',
  'General Audience',
  'Small Business Owners',
  'Students',
  'Tech Enthusiasts',
  'Parents',
  'Health & Fitness Enthusiasts',
  'Creative Professionals',
  'B2B Professionals',
  'Young Adults (18-25)',
  'Seniors (55+)',
  'Gamers',
  'Fashion & Beauty Enthusiasts'
]

export function ContentGenerator() {
  const [selectedFormat, setSelectedFormat] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([])

  // Listen for topic selection from trending topics
  useEffect(() => {
    const handleTopicSelected = (event: CustomEvent) => {
      const { topic, platform } = event.detail
      console.log('Topic selected event received:', { topic, platform })
      setSelectedTopic(topic)
      setCustomPrompt(`Generate content ideas for: \"${topic}\" (trending on ${platform})`)
      // Don't auto-generate - require user to select format and audience first
    }

    window.addEventListener('topicSelected', handleTopicSelected as EventListener)
    return () => {
      window.removeEventListener('topicSelected', handleTopicSelected as EventListener)
    }
  }, [])

  const handleGenerateWithTopic = async (topicOverride?: string, platformOverride?: string) => {
    setIsGenerating(true)
    try {
      // Use the override topic if provided, otherwise use state
      let topic = topicOverride || selectedTopic;
      
      if (!topic && customPrompt) {
        // If no selectedTopic but there's a customPrompt, use the customPrompt
        topic = customPrompt;
      } else if (!topic && !customPrompt) {
        // Fallback if nothing is selected
        topic = "Create general content ideas";
      }
      
      // Always use selectedFormat as the target platform - don't override with source platform
      const targetPlatform = platformOverride || selectedFormat || 'mixed';
      
      console.log('Generating content for topic:', topic, 'target platform:', targetPlatform);
      
      // Make API call to generate real content
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          platform: targetPlatform,
          format: selectedFormat || 'mixed',
          target_audience: selectedAudience || 'mixed',
          count: 5
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data?.ideas) {
        // Add IDs to the ideas since the UI expects them
        const ideasWithIds = result.data.ideas.map((idea: any, index: number) => ({
          ...idea,
          id: Date.now() + index // Generate unique IDs
        }))
        setGeneratedIdeas(ideasWithIds)
      } else {
        throw new Error(result.error || 'Failed to generate content')
      }
      
    } catch (error) {
      console.error('Content generation failed:', error)
      // Show error to user or fallback to mock data
      setGeneratedIdeas([{
        format: 'Error',
        title: 'Content Generation Failed',
        description: 'Unable to generate content at this time. Please try again.',
        hook: 'Sorry, something went wrong!',
        duration: 'N/A',
        tags: ['error']
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = () => {
    // Validation check
    if (!selectedFormat || !selectedAudience) {
      return // Button should already be disabled, but double-check
    }
    handleGenerateWithTopic()
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <Card data-content-generator>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Content
          </CardTitle>
          {selectedTopic && (
            <Badge variant="secondary" className="text-xs font-normal max-w-48 truncate overflow-hidden whitespace-nowrap">
              📝 {selectedTopic}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Format *</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube Video</SelectItem>
                  <SelectItem value="tiktok">TikTok/Shorts</SelectItem>
                  <SelectItem value="twitter">Twitter Thread</SelectItem>
                  <SelectItem value="instagram">Instagram Post</SelectItem>
                  <SelectItem value="blog">Blog Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience *</label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map((audience) => (
                    <SelectItem key={audience} value={audience}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Prompt (Optional)</label>
            <Textarea
              placeholder="Add specific requirements, tone, or focus areas..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !selectedFormat || !selectedAudience} 
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content Ideas
              </>
            )}
          </Button>
        </div>

        {/* Generated Ideas */}
        {(generatedIdeas.length > 0 || isGenerating) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Ideas</h3>
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span>Generating creative ideas...</span>
                </div>
              </div>
            ) : (
              generatedIdeas.map((idea, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{idea.format}</Badge>
                        {idea.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{idea.title}</h4>
                      <p className="text-gray-600 mb-3">{idea.description}</p>

                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Hook:</strong> {idea.hook}
                        </div>
                        {idea.duration && (
                          <div>
                            <strong>Duration:</strong> {idea.duration}
                          </div>
                        )}
                        {idea.word_count && (
                          <div>
                            <strong>Word Count:</strong> {idea.word_count}
                          </div>
                        )}
                        {(idea.engagement || idea.engagement_strategy) && (
                          <div>
                            <strong>Engagement:</strong> {idea.engagement_strategy || idea.engagement}
                          </div>
                        )}

                        {/* Platform-specific fields */}
                        {idea.thumbnail_concept && (
                          <div>
                            <strong>Thumbnail:</strong> {idea.thumbnail_concept}
                          </div>
                        )}
                        
                        {idea.visual_concept && (
                          <div>
                            <strong>Visual:</strong> {idea.visual_concept}
                          </div>
                        )}
                        
                        {idea.trend_element && (
                          <div>
                            <strong>Trend:</strong> {idea.trend_element}
                          </div>
                        )}

                        {idea.thread_structure && (
                          <div>
                            <strong>Thread Structure:</strong> {idea.thread_structure}
                          </div>
                        )}

                        {idea.seo_strategy && (
                          <div>
                            <strong>SEO Strategy:</strong> {idea.seo_strategy}
                          </div>
                        )}

                        {idea.seo_keywords && idea.seo_keywords.length > 0 && (
                          <div>
                            <strong>SEO Keywords:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {idea.seo_keywords.map((keyword: string) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {idea.hashtag_strategy && (
                          <div>
                            <strong>Hashtag Strategy:</strong> {idea.hashtag_strategy}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(idea.title + "\n\n" + idea.description)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
