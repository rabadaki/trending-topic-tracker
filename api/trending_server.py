#!/usr/bin/env python3

# Standard libraries
import os
import json
import asyncio
import httpx
import sys
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Web framework
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Set up logging
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

# API usage tracking
api_usage = {
    "total_requests": 0,
    "by_service": {},
    "by_endpoint": {},
    "start_time": datetime.now(),
    "total_cost_estimate": 0.0
}

# Rate limiting constants
MAX_LIMIT = 50
MAX_DAYS_BACK = 7
DEFAULT_TIMEOUT = 10.0

# Initialize FastAPI app
app = FastAPI(title="Trending Topic Tracker API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def log_api_usage(
    service: str, 
    endpoint: str, 
    requested_limit: int, 
    actual_results: Optional[int] = None,
    cost_estimate: Optional[float] = None
) -> None:
    """Log API usage for tracking and debugging."""
    api_usage["total_requests"] += 1
    
    if service not in api_usage["by_service"]:
        api_usage["by_service"][service] = 0
    api_usage["by_service"][service] += 1
    
    endpoint_key = f"{service}_{endpoint}"
    if endpoint_key not in api_usage["by_endpoint"]:
        api_usage["by_endpoint"][endpoint_key] = 0
    api_usage["by_endpoint"][endpoint_key] += 1
    
    if cost_estimate:
        api_usage["total_cost_estimate"] += cost_estimate
    
    logger.info(f"API Usage: {service}.{endpoint} | Requested: {requested_limit} | Results: {actual_results} | Cost: ${cost_estimate or 0:.4f}")

def validate_limit(limit: int, max_allowed: int, service: str = "API") -> int:
    """Validate and cap the limit parameter."""
    if limit < 1:
        logger.warning(f"{service}: limit too low ({limit}), using 1")
        return 1
    elif limit > max_allowed:
        logger.warning(f"{service}: limit too high ({limit}), capping at {max_allowed}")
        return max_allowed
    return limit

async def make_request(
    url: str, 
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    method: str = "GET",
    json_data: Optional[Dict[str, Any]] = None,
    timeout: float = DEFAULT_TIMEOUT
) -> Optional[Dict[str, Any]]:
    """Make HTTP request with proper error handling and rate limiting."""
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if method.upper() == "POST":
                response = await client.post(url, params=params, headers=headers, json=json_data)
            else:
                response = await client.get(url, params=params, headers=headers)
            
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        logger.error(f"Request timeout for {url}")
        return None
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error {e.response.status_code} for {url}")
        return None
    except Exception as e:
        logger.error(f"Request failed for {url}: {str(e)}")
        return None

# ============================================================================
# TRENDING TOPIC FUNCTIONS
# ============================================================================

async def get_reddit_trending(
    subreddit: str = "all",
    sort: str = "hot", 
    time: str = "day",
    limit: int = 10
) -> Dict[str, Any]:
    """Get trending posts from Reddit."""
    limit = validate_limit(limit, MAX_LIMIT, "Reddit")
    
    headers = {
        "User-Agent": "TrendingTopicTracker/1.0 (by /u/TrendingBot)"
    }
    
    if subreddit == "all":
        url = f"https://www.reddit.com/r/all.json"
    else:
        url = f"https://www.reddit.com/r/{subreddit}.json"
    
    params = {
        "limit": limit,
        "sort": sort,
        "t": time
    }
    
    try:
        data = await make_request(url, params=params, headers=headers)
        
        if not data or 'data' not in data or 'children' not in data['data']:
            return {"error": "Invalid Reddit response", "posts": []}
        
        posts = []
        for item in data['data']['children']:
            post_data = item['data']
            posts.append({
                "id": post_data.get('id'),
                "title": post_data.get('title'),
                "subreddit": post_data.get('subreddit'),
                "score": post_data.get('score', 0),
                "num_comments": post_data.get('num_comments', 0),
                "created_utc": post_data.get('created_utc'),
                "url": post_data.get('url'),
                "permalink": f"https://reddit.com{post_data.get('permalink', '')}",
                "author": post_data.get('author'),
                "upvote_ratio": post_data.get('upvote_ratio', 0),
                "selftext": post_data.get('selftext', '')[:200] + "..." if post_data.get('selftext', '') else ""
            })
        
        log_api_usage("Reddit", "trending", limit, len(posts))
        
        return {
            "platform": "reddit",
            "subreddit": subreddit,
            "sort": sort,
            "time_period": time,
            "posts": posts,
            "count": len(posts),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Reddit trending error: {str(e)}")
        return {"error": str(e), "posts": []}

async def search_twitter_trends(
    query: str = "",
    location: str = "worldwide",
    limit: int = 10
) -> Dict[str, Any]:
    """Search for Twitter trends. Using mock data for now until Twitter API is set up."""
    limit = validate_limit(limit, MAX_LIMIT, "Twitter")
    
    # Mock trending data for now - replace with real API later
    mock_trends = [
        {"name": "#AIRevolution", "volume": 45672, "growth": "+234%"},
        {"name": "#CreatorEconomy", "volume": 23451, "growth": "+123%"},
        {"name": "#TechTrends2025", "volume": 18923, "growth": "+98%"},
        {"name": "#SocialMedia", "volume": 15234, "growth": "+87%"},
        {"name": "#DigitalMarketing", "volume": 12456, "growth": "+65%"}
    ]
    
    # Filter by query if provided
    if query:
        mock_trends = [trend for trend in mock_trends if query.lower() in trend["name"].lower()]
    
    trends = mock_trends[:limit]
    
    log_api_usage("Twitter", "trends", limit, len(trends))
    
    return {
        "platform": "twitter",
        "query": query,
        "location": location,
        "trends": trends,
        "count": len(trends),
        "timestamp": datetime.now().isoformat(),
        "note": "Using mock data - Twitter API integration pending"
    }

async def get_tiktok_trending(
    query: str = "",
    limit: int = 10
) -> Dict[str, Any]:
    """Get TikTok trending topics. Using mock data for now."""
    limit = validate_limit(limit, MAX_LIMIT, "TikTok")
    
    # Mock trending data for now
    mock_trends = [
        {"title": "Morning Routine Optimization", "views": "2.3M", "likes": "456K", "growth": "+189%"},
        {"title": "Budget-Friendly Home Decor", "views": "1.8M", "likes": "234K", "growth": "+145%"},
        {"title": "Quick Healthy Recipes", "views": "1.2M", "likes": "189K", "growth": "+112%"},
        {"title": "Productivity Hacks", "views": "987K", "likes": "156K", "growth": "+98%"},
        {"title": "Tech Reviews 2025", "views": "876K", "likes": "143K", "growth": "+87%"}
    ]
    
    if query:
        mock_trends = [trend for trend in mock_trends if query.lower() in trend["title"].lower()]
    
    trends = mock_trends[:limit]
    
    log_api_usage("TikTok", "trending", limit, len(trends))
    
    return {
        "platform": "tiktok",
        "query": query,
        "trends": trends,
        "count": len(trends),
        "timestamp": datetime.now().isoformat(),
        "note": "Using mock data - TikTok API integration pending"
    }

async def generate_content_ideas(
    topic: str,
    platform: str = "general",
    format: str = "mixed",
    target_audience: str = "general",
    limit: int = 5
) -> Dict[str, Any]:
    """Generate AI-powered content ideas based on trending topics."""
    limit = validate_limit(limit, 10, "ContentGeneration")
    
    # Mock AI-generated content ideas for now
    mock_ideas = [
        {
            "format": "YouTube Video",
            "title": f"5 {topic} Tips That Will Transform Your Workflow",
            "description": f"Create a comprehensive tutorial about {topic}, including demonstrations and real-world use cases.",
            "hook": f"Start with a before/after comparison of {topic} implementation",
            "duration": "8-12 minutes",
            "tags": [topic.lower(), "tutorial", "tips"]
        },
        {
            "format": "TikTok/Shorts",
            "title": f"{topic} Hack of the Day",
            "description": f"Quick 60-second video featuring one {topic} benefit and demo.",
            "hook": f"This {topic} trick will save you hours",
            "duration": "60 seconds",
            "tags": [topic.lower(), "hack", "quick-tips"]
        },
        {
            "format": "Twitter Thread",
            "title": f"10 {topic} Facts Everyone Should Know",
            "description": f"Detailed thread breaking down essential {topic} information.",
            "hook": f"Start with a bold claim about {topic} benefits",
            "engagement": "Include polls and questions",
            "tags": [topic.lower(), "thread", "facts"]
        },
        {
            "format": "Instagram Post",
            "title": f"{topic} vs Traditional Methods",
            "description": f"Visual comparison showing {topic} advantages.",
            "hook": "Side-by-side comparison",
            "duration": "carousel post",
            "tags": [topic.lower(), "comparison", "visual"]
        },
        {
            "format": "Blog Post",
            "title": f"The Complete Guide to {topic}",
            "description": f"In-depth article covering {topic} best practices and trends.",
            "hook": f"Start with surprising {topic} statistics",
            "word_count": "2000-3000 words",
            "tags": [topic.lower(), "guide", "long-form"]
        }
    ]
    
    # Filter by format if specified
    if format != "mixed":
        mock_ideas = [idea for idea in mock_ideas if format.lower() in idea["format"].lower()]
    
    ideas = mock_ideas[:limit]
    
    log_api_usage("AI", "content_generation", limit, len(ideas))
    
    return {
        "topic": topic,
        "platform": platform,
        "format": format,
        "target_audience": target_audience,
        "ideas": ideas,
        "count": len(ideas),
        "timestamp": datetime.now().isoformat(),
        "note": "Using mock AI generation - OpenAI/Anthropic integration pending"
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Trending Topic Tracker API",
        "version": "1.0.0",
        "description": "API for tracking trending topics and generating content ideas",
        "endpoints": {
            "reddit_trending": "/trending/reddit",
            "twitter_trends": "/trending/twitter", 
            "tiktok_trending": "/trending/tiktok",
            "content_generation": "/generate/content",
            "usage_stats": "/stats/usage"
        },
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/trending/reddit")
async def api_reddit_trending(
    subreddit: str = "all",
    sort: str = "hot",
    time: str = "day", 
    limit: int = 10
):
    """Get trending posts from Reddit."""
    return await get_reddit_trending(subreddit, sort, time, limit)

@app.get("/trending/twitter")
async def api_twitter_trends(
    query: str = "",
    location: str = "worldwide",
    limit: int = 10
):
    """Get Twitter trending topics."""
    return await search_twitter_trends(query, location, limit)

@app.get("/trending/tiktok") 
async def api_tiktok_trending(
    query: str = "",
    limit: int = 10
):
    """Get TikTok trending topics."""
    return await get_tiktok_trending(query, limit)

@app.post("/generate/content")
async def api_generate_content(
    topic: str,
    platform: str = "general",
    format: str = "mixed",
    target_audience: str = "general",
    limit: int = 5
):
    """Generate content ideas based on trending topics."""
    return await generate_content_ideas(topic, platform, format, target_audience, limit)

@app.get("/stats/usage")
async def api_usage_stats():
    """Get API usage statistics."""
    uptime = datetime.now() - api_usage["start_time"]
    return {
        "total_requests": api_usage["total_requests"],
        "by_service": api_usage["by_service"],
        "by_endpoint": api_usage["by_endpoint"],
        "uptime_seconds": uptime.total_seconds(),
        "total_cost_estimate": api_usage["total_cost_estimate"],
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Trending Topic Tracker API on port {port}")
    uvicorn.run("trending_server:app", host="0.0.0.0", port=port, reload=True) 