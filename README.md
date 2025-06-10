# Trending Topic Tracker & AI Content Generator

A B2B web application that automates trending topic discovery across Reddit, Twitter, and TikTok, then generates AI-powered content ideas tailored to user requirements.

## ✨ What's Built

### **Priority 1 & 2 - COMPLETE** ✅

- **Backend Infrastructure**: TypeScript API routes in Next.js
- **Real Data Integration**: Apify API for Reddit, Twitter, TikTok
- **AI Content Generation**: OpenAI integration for content ideas
- **Frontend Updates**: Real API consumption with loading states
- **Error Handling**: Comprehensive error management and retry logic
- **Usage Tracking**: API usage statistics and cost monitoring

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes with Apify and OpenAI integration
- **Data Sources**: Reddit, Twitter, TikTok via Apify actors
- **AI Engine**: OpenAI GPT-4o-mini for content generation
- **Type Safety**: Comprehensive TypeScript definitions

## 📁 Project Structure

```
trending-topic-tracker/
├── app/
│   ├── api/
│   │   ├── trending/
│   │   │   ├── reddit/route.ts      # Reddit trending endpoint
│   │   │   ├── twitter/route.ts     # Twitter trending endpoint
│   │   │   └── tiktok/route.ts      # TikTok trending endpoint
│   │   ├── generate/
│   │   │   └── content/route.ts     # AI content generation
│   │   └── stats/route.ts           # API usage statistics
├── lib/
│   ├── types.ts                     # TypeScript definitions
│   ├── api-utils.ts                 # API utilities & Apify integration
│   └── api-hooks.ts                 # React hooks for API calls
├── components/
│   ├── trending-topics.tsx          # Updated with real API integration
│   └── content-generator.tsx        # Ready for AI integration
└── updated-prd.md                   # Product requirements
```

## 🚀 Quick Start

### **1. Environment Setup**

Create a `.env.local` file:

```bash
# Required API Keys
APIFY_API_TOKEN=your_apify_api_token_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **2. Get API Keys**

**Apify API Token:**
1. Sign up at [apify.com](https://apify.com)
2. Go to Settings → Integrations → API tokens
3. Create a new token
4. Copy to `.env.local`

**OpenAI API Key:**
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API keys section
3. Create a new secret key
4. Copy to `.env.local`

### **3. Installation & Run**

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🎯 API Endpoints

### **Trending Data**

```bash
# Reddit trending posts
GET /api/trending/reddit?subreddit=all&sort=hot&time=day&limit=10

# Twitter trending topics  
GET /api/trending/twitter?query=&location=worldwide&limit=10

# TikTok trending content
GET /api/trending/tiktok?hashtag=&query=trending&limit=10
```

### **AI Content Generation**

```bash
POST /api/generate/content
{
  "topic": "AI Tools for Content Creation",
  "platform": "youtube",
  "format": "video",
  "target_audience": "content-creators",
  "count": 5
}
```

### **Usage Statistics**

```bash
GET /api/stats
```

## 🧪 Testing the APIs

### **1. Reddit Trending**

```bash
curl "http://localhost:3000/api/trending/reddit?subreddit=artificial&limit=5"
```

### **2. AI Content Generation**

```bash
curl -X POST "http://localhost:3000/api/generate/content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI productivity tools",
    "platform": "youtube", 
    "format": "video",
    "count": 3
  }'
```

## 💡 Usage Examples

### **React Hooks**

```typescript
import { useRedditTrending, useContentGeneration } from '@/lib/api-hooks'

// Get Reddit trending data
const { data, loading, error, refetch } = useRedditTrending('programming', 'hot', 'day', 10)

// Generate content ideas
const { generateContent } = useContentGeneration()
const ideas = await generateContent({
  topic: "React best practices",
  platform: "youtube",
  format: "video"
})
```

## 📊 What Works Now

### **✅ Fully Functional**

1. **Real Reddit Data**: Live trending posts from any subreddit
2. **Real Twitter Data**: Trending topics and hashtags
3. **Real TikTok Data**: Trending videos and hashtags
4. **AI Content Ideas**: OpenAI-powered content generation
5. **Error Handling**: Graceful failures with retry buttons
6. **Loading States**: Smooth UX with loading indicators
7. **Usage Tracking**: Monitor API calls and costs

### **🎨 UI Features**

- Real-time data updates
- Platform-specific trending tabs
- Engagement metrics display
- Click-to-generate content ideas
- External links to original posts
- Responsive design

## 🛠️ Development

### **Adding New Platforms**

1. Create new API route in `app/api/trending/[platform]/route.ts`
2. Add types to `lib/types.ts`
3. Create formatter in `lib/api-utils.ts`
4. Add hook to `lib/api-hooks.ts`
5. Update UI component

### **Debugging**

```bash
# Check API logs
npm run dev

# Test specific endpoint
curl "http://localhost:3000/api/trending/reddit?limit=1"

# View usage stats
curl "http://localhost:3000/api/stats"
```

## 🔧 Troubleshooting

### **Common Issues**

1. **"Missing environment variables"**: Add API keys to `.env.local`
2. **"Failed to fetch"**: Check Apify/OpenAI API key validity
3. **"No data returned"**: Try different parameters or check API limits
4. **TypeScript errors**: Run `npm run build` to check all types

### **API Limits**

- **Apify**: Usage-based pricing, generous free tier
- **OpenAI**: Pay-per-use, ~$0.002 per content generation
- **Rate Limiting**: Built-in retry logic and error handling

## 📈 Cost Estimates

- **Reddit API via Apify**: ~$0.01 per 10 posts
- **Twitter API via Apify**: ~$0.05 per 10 trends  
- **TikTok API via Apify**: ~$0.03 per 10 videos
- **OpenAI Content Generation**: ~$0.002 per 5 ideas

**Daily cost for moderate usage**: < $1.00

## 🔄 Next Steps

### **Priority 3: Enhanced Features**
- [ ] Content scheduling and publishing
- [ ] Analytics dashboard improvements  
- [ ] User preference learning
- [ ] Advanced filtering options

### **Priority 4: Scale & Performance**
- [ ] Database integration (PostgreSQL)
- [ ] Caching layer (Redis)
- [ ] Background job processing
- [ ] User authentication system

The core trending discovery and AI content generation is **fully functional** and ready to use! 🎉
- Radix UI Components
- React Hook Form
- Recharts for analytics

## Features

- Real-time trending topic discovery
- AI-powered content generation
- Cross-platform monitoring (Reddit, Twitter, TikTok)
- Content idea organization and export
- Analytics and reporting dashboard

This project follows the specifications in `updated-prd.md`. 