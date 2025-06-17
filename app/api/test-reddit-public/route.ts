import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subreddit = searchParams.get('subreddit') || 'programming'
  
  try {
    console.log(`[Test] Trying Reddit public endpoint for r/${subreddit}`)
    
    // Test Reddit's public JSON endpoint (no OAuth required)
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=2`,
      {
        headers: {
          'User-Agent': 'TrendingTopicTracker/1.0'
        }
      }
    )
    
    console.log(`[Test] Response status: ${response.status}`)
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        endpoint: 'public'
      })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      endpoint: 'public',
      hasData: !!data.data,
      hasChildren: !!data.data?.children,
      postCount: data.data?.children?.length || 0,
      firstPost: data.data?.children?.[0]?.data?.title || 'N/A',
      data: data.data?.children?.slice(0, 2).map((post: any) => ({
        title: post.data.title,
        score: post.data.score,
        author: post.data.author
      })) || []
    })
    
  } catch (error) {
    console.error('[Test] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: 'public'
    })
  }
} 