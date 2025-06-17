import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  validateLimit, 
  logApiUsage,
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling
} from '@/lib/api-utils'
import { ContentGenerationResponse, ContentIdea, TrendingApiError } from '@/lib/types'

// Initialize OpenAI only when API key is available
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new TrendingApiError(
      'OpenAI API key not configured',
      'MISSING_OPENAI_KEY'
    )
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function generateContent(
  topic: string,
  platform: string = 'youtube',
  format: string = 'video',
  targetAudience: string = 'content-creators',
  count: number = 5
): Promise<ContentGenerationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new TrendingApiError(
      'OpenAI API key not configured',
      'MISSING_OPENAI_KEY'
    )
  }
  
  const validatedCount = validateLimit(count, 10)
  
  // OPTIMIZED PLATFORM-SPECIFIC PROMPTS
  const getOptimizedPrompt = (platform: string, format: string) => {
    const baseContext = `**TRENDING TOPIC:** "${topic}"
**TARGET AUDIENCE:** ${targetAudience}
**GENERATE:** ${validatedCount} viral-ready content ideas`

    switch (platform.toLowerCase()) {
      case 'youtube':
        return `${baseContext}

**YOUTUBE OPTIMIZATION STRATEGY:**
You're a viral YouTube strategist. Create content that gets clicks, holds attention, and drives engagement.

**REQUIREMENTS:**
- 5-12 minute optimal length videos
- Strong SEO-focused titles (60-70 characters)
- Attention-grabbing thumbnails concepts
- High retention hooks in first 15 seconds
- Clear value propositions

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "SEO-optimized title with power words (60-70 chars)",
    "hook": "First 15-second opener that prevents clicking away",
    "description": "Clear video outline with timestamps and value",
    "content_type": "youtube",
    "duration": "8-12 minutes",
    "engagement_strategy": "Specific CTA for comments/likes/subscriptions",
    "thumbnail_concept": "Visual hook description",
    "seo_keywords": ["keyword1", "keyword2", "keyword3"],
    "tags": ["#youtube", "#viral", "#${platform}"]
  }
]
\`\`\`

**VIRAL HOOKS TO USE:**
- "If you like [popular thing], you'll love this..."
- "The #1 mistake every [audience] makes..."
- "Watch this if you [common problem]..."
- Start with shocking statistics or bold claims`

      case 'tiktok':
        return `${baseContext}

**TIKTOK VIRAL FORMULA:**
You're a TikTok algorithm expert. Create content that hooks in 3 seconds and drives completion rates.

**REQUIREMENTS:**
- 15-60 second videos optimized for completion
- Trend-aware content using current sounds/effects
- High visual engagement from second 1
- Strong re-watch value
- Clear, punchy messaging

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "Scroll-stopping title (under 100 characters)",
    "hook": "3-second attention grabber that creates curiosity gap",
    "description": "Quick execution guide with visual cues",
    "content_type": "tiktok",
    "duration": "30-60 seconds",
    "engagement_strategy": "Comment bait question or challenge",
    "visual_concept": "What viewers see in first 3 seconds",
    "trend_element": "Current trend/sound to leverage",
    "tags": ["#fyp", "#viral", "#trending", "#${topic.toLowerCase().replace(/\s+/g, '')}"]
  }
]
\`\`\`

**VIRAL TIKTOK HOOKS:**
- "POV: You just discovered..."
- "Tell me you [X] without telling me..."
- "Things that just make sense..."
- "This [item/idea] is actually..."
- Start with visual contradiction or surprise`

      case 'twitter':
        return `${baseContext}

**TWITTER THREAD STRATEGY:**
You're a Twitter growth expert. Create threads that get bookmarked, retweeted, and drive followers.

**REQUIREMENTS:**
- 280 characters per tweet optimization
- Thread-worthy value (5-10 tweets)
- High shareability factor
- Clear takeaways and actionables
- Strong thread hooks

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "Thread opener that promises value (under 280 chars)",
    "hook": "Tweet 1: Hook that makes people want to read thread",
    "description": "Thread structure: 5-10 tweets with clear flow",
    "content_type": "twitter_thread",
    "tweet_count": "7-10 tweets",
    "engagement_strategy": "Retweet ask or discussion starter",
    "thread_structure": "1. Hook 2. Problem 3-7. Solutions 8. Conclusion/CTA",
    "tags": ["#TwitterTips", "#Thread", "#${topic.toLowerCase().replace(/\s+/g, '')}"]
  }
]
\`\`\`

**VIRAL TWITTER HOOKS:**
- "🧵 THREAD: Everything I learned about [topic]..."
- "Unpopular opinion about [topic]:"
- "Here's what most people get wrong about [topic]:"
- "10 [topic] tips I wish I knew earlier:"
- Use numbers, emojis, and controversial takes`

      case 'instagram':
        return `${baseContext}

**INSTAGRAM ENGAGEMENT STRATEGY:**
You're an Instagram growth specialist. Create visually-driven content that stops the scroll and drives saves.

**REQUIREMENTS:**
- 138-150 character captions for max engagement
- High visual appeal and aesthetic value
- Save-worthy educational or inspirational content
- Strong storytelling elements
- Community engagement focus

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "Caption hook (138-150 characters ideal)",
    "hook": "First line that stops the scroll",
    "description": "Visual concept + caption strategy",
    "content_type": "instagram_post",
    "format_type": "carousel/reel/single_post",
    "engagement_strategy": "Save-worthy value + question for comments",
    "visual_concept": "What the post looks like visually",
    "hashtag_strategy": "Mix of trending and niche hashtags",
    "tags": ["#instagram", "#viral", "#${topic.toLowerCase().replace(/\s+/g, '')}"]
  }
]
\`\`\`

**VIRAL INSTAGRAM HOOKS:**
- "Save this post if you..."
- "POV: You're learning about..."
- "Swipe for the truth about..."
- "Here's what nobody tells you about..."
- Use carousel format for step-by-step content`

      case 'blog':
        return `${baseContext}

**SEO BLOG OPTIMIZATION:**
You're an SEO content strategist. Create blog content that ranks on Google and drives organic traffic.

**REQUIREMENTS:**
- 1000-2000 word optimization
- Strong SEO keyword integration
- Scannable format with headers
- Clear value proposition and takeaways
- Internal linking opportunities

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "SEO-optimized blog title (60-70 characters with target keyword)",
    "hook": "Opening paragraph that addresses search intent",
    "description": "Article outline with H2/H3 structure and key points",
    "content_type": "blog_post",
    "word_count": "1500-2000 words",
    "engagement_strategy": "Call-to-action and comment encouragement",
    "seo_strategy": "Primary and secondary keywords with search intent",
    "content_structure": "Intro, 3-5 main sections, conclusion, CTA",
    "tags": ["#SEO", "#blog", "#${topic.toLowerCase().replace(/\s+/g, '')}"]
  }
]
\`\`\`

**SEO BLOG HOOKS:**
- "The Complete Guide to [topic]"
- "How to [achieve result] in [timeframe]"
- "[Number] [topic] Tips That Actually Work"
- "Why [common belief] is Wrong About [topic]"
- Address specific search queries and pain points`

      default:
        return `${baseContext}

**MIXED PLATFORM STRATEGY:**
Create versatile content that can be adapted across multiple platforms.

**JSON FORMAT:**
\`\`\`json
[
  {
    "title": "Cross-platform optimized title",
    "hook": "Universal attention-grabbing opener",
    "description": "Adaptable content concept with platform variations",
    "content_type": "${format}",
    "duration": "Varies by platform",
    "engagement_strategy": "Universal engagement tactic",
    "platform_adaptations": "How to modify for each platform",
    "tags": ["#content", "#${topic.toLowerCase().replace(/\s+/g, '')}"]
  }
]
\`\`\`

Focus on trending topic relevance and immediate actionability.`
    }
  }

  const prompt = getOptimizedPrompt(platform, format)

  try {
    console.log(`Generating content for topic: "${topic}" (${platform}/${format}, ${validatedCount} ideas)`)
    
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert content strategist and social media specialist. Generate creative, engaging content ideas that are optimized for maximum reach and engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new TrendingApiError('No content generated from OpenAI', 'OPENAI_NO_RESPONSE')
    }

    // Parse the JSON response
    let ideas: ContentIdea[]
    try {
      // Clean the response and extract JSON - handle markdown code blocks
      let jsonText = responseText.trim()
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      
      // Try to extract JSON array from the response
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      
      // Remove trailing commas that might cause JSON parsing errors
      const cleanJson = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
      
      ideas = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      console.log('Raw response:', responseText)
      
      // Fallback: create ideas from the text response
      ideas = [{
        format,
        title: `${topic} Content Ideas`,
        description: responseText.substring(0, 200) + '...',
        hook: `Want to know about ${topic}?`,
        duration: format === 'video' ? '3-5 minutes' : undefined,
        word_count: format !== 'video' ? '500-800 words' : undefined,
        engagement: 'Ask viewers to share their thoughts in comments',
        tags: [topic.toLowerCase().replace(/\s+/g, ''), platform, format]
      }]
    }

    // Ensure all ideas have the required format field and map new fields to old structure
    const formattedIdeas = ideas.map(idea => ({
      ...idea,
      format: idea.format || idea.content_type || format,
      // Map new streamlined fields to existing structure
      description: idea.description || '',
      engagement: idea.engagement_strategy || idea.engagement || 'Ask for engagement in comments',
      tags: Array.isArray(idea.tags) ? idea.tags : [topic.toLowerCase().replace(/\s+/g, '')]
    }))

    // Log usage (estimate cost)
    const estimatedCost = 0.002 * (prompt.length / 1000) // Rough estimate
    logApiUsage('OpenAI', 'content-generation', validatedCount, formattedIdeas.length, estimatedCost)

    return {
      topic,
      platform,
      format,
      target_audience: targetAudience,
      ideas: formattedIdeas,
      count: formattedIdeas.length,
      timestamp: new Date().toISOString(),
    }

  } catch (error) {
    console.error('Content generation error:', error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CONTENT_GENERATION_FAILED',
      error
    )
  }
}

// OLD PROMPT FUNCTION FOR COMPARISON
async function generateContentOldPrompt(
  topic: string,
  platform: string = 'youtube',
  format: string = 'video',
  targetAudience: string = 'content-creators',
  count: number = 5
): Promise<ContentGenerationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new TrendingApiError(
      'OpenAI API key not configured',
      'MISSING_OPENAI_KEY'
    )
  }
  
  const validatedCount = validateLimit(count, 10)
  
  // OLD COMPREHENSIVE PROMPT
  const oldPrompt = `
You are creating content ideas about this SPECIFIC TOPIC: "${topic}"

Your content ideas must be directly related to this topic. Do NOT create generic content about "content creation" or "trends" - focus on the actual topic mentioned.

Generate ${validatedCount} creative content ideas that are specifically about: "${topic}"

Requirements:
- Platform: ${platform}
- Format: ${format}
- Target Audience: ${targetAudience}
- Each idea should be unique and directly related to the topic
- Include actionable hooks and descriptions
- Optimize for the specified platform's best practices

For each content idea, provide:
1. Title (catchy and click-worthy)
2. Description (2-3 sentences explaining the concept)
3. Hook (opening line to grab attention)
4. Duration/Word Count (appropriate for format)
5. Tags (relevant hashtags/keywords)
6. Engagement Strategy (how to encourage interaction)

Format the response as a JSON array of objects with these fields:
- title
- description  
- hook
- duration (for videos) or word_count (for written content)
- engagement
- tags (array of strings)

Make sure each idea is:
- Trendy and timely
- Platform-optimized
- Audience-appropriate
- Actionable and specific
- Engaging and shareable
`

  try {
    console.log(`Generating content (OLD PROMPT) for topic: "${topic}" (${platform}/${format}, ${validatedCount} ideas)`)
    
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert content strategist and social media specialist. Generate creative, engaging content ideas that are optimized for maximum reach and engagement."
        },
        {
          role: "user",
          content: oldPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new TrendingApiError('No content generated from OpenAI', 'OPENAI_NO_RESPONSE')
    }

    // Parse the JSON response (same logic as new prompt)
    let ideas: ContentIdea[]
    try {
      let jsonText = responseText.trim()
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      const cleanJson = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
      ideas = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response (OLD PROMPT):', parseError)
      console.log('Raw response (OLD PROMPT):', responseText)
      
      ideas = [{
        format,
        title: `${topic} Content Ideas`,
        description: responseText.substring(0, 200) + '...',
        hook: `Want to know about ${topic}?`,
        duration: format === 'video' ? '3-5 minutes' : undefined,
        word_count: format !== 'video' ? '500-800 words' : undefined,
        engagement: 'Ask viewers to share their thoughts in comments',
        tags: [topic.toLowerCase().replace(/\s+/g, ''), platform, format]
      }]
    }

    const formattedIdeas = ideas.map(idea => ({
      ...idea,
      format: idea.format || format,
      tags: Array.isArray(idea.tags) ? idea.tags : [topic.toLowerCase().replace(/\s+/g, '')]
    }))

    const estimatedCost = 0.002 * (oldPrompt.length / 1000)
    logApiUsage('OpenAI', 'content-generation-old', validatedCount, formattedIdeas.length, estimatedCost)

    return {
      topic,
      platform,
      format,
      target_audience: targetAudience,
      ideas: formattedIdeas,
      count: formattedIdeas.length,
      timestamp: new Date().toISOString(),
    }

  } catch (error) {
    console.error('Content generation error (OLD PROMPT):', error)
    
    if (error instanceof TrendingApiError) {
      throw error
    }
    
    throw new TrendingApiError(
      `Failed to generate content (OLD PROMPT): ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CONTENT_GENERATION_FAILED',
      error
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const useOldPrompt = searchParams.get('old') === 'true'
    
    // Extract parameters from request body
    const {
      topic,
      platform = 'youtube',
      format = 'video',
      target_audience = 'content-creators',
      count = 5
    } = body
    
    if (!topic) {
      return NextResponse.json(
        createErrorResponse('Topic is required'),
        { status: 400 }
      )
    }
    
    // Generate content using old or new prompt based on query param
    const data = useOldPrompt 
      ? await withErrorHandling(generateContentOldPrompt)(topic, platform, format, target_audience, count)
      : await withErrorHandling(generateContent)(topic, platform, format, target_audience, count)
    
    return NextResponse.json(createSuccessResponse(data))
    
  } catch (error) {
    console.error('Content generation API route error:', error)
    
    if (error instanceof TrendingApiError) {
      return NextResponse.json(
        createErrorResponse(error.message),
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
} 