"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, Download, RefreshCw } from "lucide-react"

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

export function ContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<string>("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generatedIdeas, setGeneratedIdeas] = useState(contentIdeas)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    // In a real app, this would call the AI API
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Format</label>
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
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creators">Content Creators</SelectItem>
                  <SelectItem value="marketers">Digital Marketers</SelectItem>
                  <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                  <SelectItem value="general">General Audience</SelectItem>
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

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Ideas</h3>
          {generatedIdeas.map((idea) => (
            <div key={idea.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{idea.format}</Badge>
                    {idea.tags.map((tag) => (
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
                    {idea.wordCount && (
                      <div>
                        <strong>Word Count:</strong> {idea.wordCount}
                      </div>
                    )}
                    {idea.engagement && (
                      <div>
                        <strong>Engagement:</strong> {idea.engagement}
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
