import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    const appId = process.env.FACEBOOK_APP_ID
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v18.0'

    if (!accessToken || !businessAccountId || !appId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        missing: {
          accessToken: !accessToken,
          businessAccountId: !businessAccountId,
          appId: !appId
        }
      }, { status: 400 })
    }

    // Test 1: Validate the access token
    console.log('Testing Instagram Graph API token validation...')
    const tokenValidationResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/me?access_token=${accessToken}`
    )
    
    const tokenValidationData = await tokenValidationResponse.json()
    
    if (!tokenValidationResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Token validation failed',
        details: tokenValidationData,
        step: 'token_validation'
      }, { status: 400 })
    }

    // Test 2: Check Instagram business account access
    console.log('Testing Instagram business account access...')
    const accountResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/${businessAccountId}?fields=id,username,account_type&access_token=${accessToken}`
    )
    
    const accountData = await accountResponse.json()
    
    if (!accountResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Business account access failed',
        details: accountData,
        step: 'account_access'
      }, { status: 400 })
    }

    // Test 3: Try to fetch some media
    console.log('Testing media access...')
    const mediaResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/${businessAccountId}/media?fields=id,caption,media_type&limit=1&access_token=${accessToken}`
    )
    
    const mediaData = await mediaResponse.json()
    
    if (!mediaResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Media access failed',
        details: mediaData,
        step: 'media_access'
      }, { status: 400 })
    }

    // Test 4: Try hashtag search
    console.log('Testing hashtag search...')
    const hashtagResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/ig_hashtag_search?user_id=${businessAccountId}&q=productivity&access_token=${accessToken}`
    )
    
    const hashtagData = await hashtagResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Instagram Graph API validation successful',
      tests: {
        tokenValidation: {
          success: true,
          data: tokenValidationData
        },
        accountAccess: {
          success: true,
          data: accountData
        },
        mediaAccess: {
          success: true,
          data: mediaData
        },
        hashtagSearch: {
          success: hashtagResponse.ok,
          data: hashtagData
        }
      },
      config: {
        apiVersion,
        businessAccountId,
        appId
      }
    })

  } catch (error) {
    console.error('Instagram token validation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 