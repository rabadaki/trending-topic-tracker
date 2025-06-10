import { NextResponse } from 'next/server'
import { getApiUsageStats, createSuccessResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const stats = getApiUsageStats()
    return NextResponse.json(createSuccessResponse(stats))
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    )
  }
} 