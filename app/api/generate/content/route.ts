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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  
  // Create a comprehensive prompt for content generation
  const prompt = `
Generate ${validatedCount} content ideas for the trending topic: "${topic}"

Requirements:
- Platform: ${platform}
- Format: ${format}
- Target Audience: ${targetAudience}
- Each idea should be unique and engaging
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
    console.log(`Generating content for topic: "${topic}" (${platform}/${format}, ${validatedCount} ideas)`)
    
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
      // Clean the response and extract JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      ideas = JSON.parse(jsonMatch[0])
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

    // Ensure all ideas have the required format field
    const formattedIdeas = ideas.map(idea => ({
      ...idea,
      format: idea.format || format,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
    
    // Generate content
    const data = await withErrorHandling(generateContent)(
      topic,
      platform,
      format,
      target_audience,
      count
    )
    
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