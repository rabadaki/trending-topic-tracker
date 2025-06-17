# Trending Topic Tracker & AI Content Generator

A B2B web application that automates trending topic discovery across **Reddit, Twitter, TikTok, and Instagram**, then generates AI-powered content ideas tailored to user requirements.

## ✨ Current Status - FULLY FUNCTIONAL ✅

### **Complete & Production Ready** 🚀

- **✅ Backend Infrastructure**: TypeScript API routes with comprehensive error handling
- **✅ Multi-Platform Integration**: Reddit, Twitter, TikTok, **Instagram** via Apify APIs
- **✅ AI Content Generation**: OpenAI integration for content ideas
- **✅ TypeScript Refactor**: Fully typed with proper interfaces and JSDoc documentation
- **✅ Frontend Updates**: Real API consumption with loading states and error handling
- **✅ Platform-Aware Engagement**: Smart thresholds for accurate viral/high/medium/low classification
- **✅ Usage Tracking**: API usage statistics and cost monitoring
- **✅ Production Build**: Clean, optimized build with no errors

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes with Apify and OpenAI integration
- **Data Sources**: Reddit, Twitter, TikTok, Instagram via Apify actors
- **AI Engine**: OpenAI GPT-4o-mini for content generation
- **Type Safety**: Comprehensive TypeScript definitions with proper interfaces

## 📁 Project Structure

```
trending-topic-tracker/
├── app/
│   ├── api/
│   │   ├── trending/
│   │   │   ├── reddit/route.ts      # Reddit trending endpoint
│   │   │   ├── twitter/route.ts     # Twitter trending endpoint
│   │   │   ├── tiktok/route.ts      # TikTok trending endpoint
│   │   │   └── instagram/route.ts   # Instagram trending endpoint ✨
│   │   ├── generate/
│   │   │   └── content/route.ts     # AI content generation
│   │   └── stats/route.ts           # API usage statistics
├── lib/
│   ├── types.ts                     # TypeScript interfaces for all platforms
│   ├── api-utils.ts                 # API utilities & Apify integration
│   ├── api-hooks.ts                 # React hooks for API calls
│   └── settings-utils.ts            # Platform settings management
├── components/
│   ├── trending-topics.tsx          # Multi-platform trending viewer
│   └── content-generator.tsx        # AI content generation UI
└── README.md                        # This file
```

## 🚀 Quick Start

### **1. Environment Setup**

Create a `.env.local` file:

```bash
# Required API Keys
APIFY_API_TOKEN=your_apify_api_token
OPENAI_API_KEY=your_openai_api_key

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
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000

# Build for production
npm run build
```

## 📊 Platform-Specific Engagement System

### **Smart Engagement Thresholds** ✨

Our system uses **platform-aware engagement thresholds** because each platform has different engagement scales:

#### 🔴 Reddit
- **Metric**: Upvotes (score)
- **🔥 Viral**: 1,000+ upvotes
- **⚡ High**: 500+ upvotes  
- **📈 Medium**: 100+ upvotes
- **⚪ Low**: Under 100 upvotes

#### 🐦 Twitter
- **Metric**: Combined engagement (retweets + tweet volume)
- **🔥 Viral**: 5,000+ interactions
- **⚡ High**: 1,000+ interactions  
- **📈 Medium**: 100+ interactions
- **⚪ Low**: Under 100 interactions

#### 📱 TikTok  
- **Metric**: Likes count
- **🔥 Viral**: 10,000+ likes
- **⚡ High**: 5,000+ likes
- **📈 Medium**: 1,000+ likes
- **⚪ Low**: Under 1,000 likes

#### 📷 Instagram
- **Metric**: Likes count
- **🔥 Viral**: 10,000+ likes
- **⚡ High**: 5,000+ likes
- **📈 Medium**: 1,000+ likes
- **⚪ Low**: Under 1,000 likes

### **🎯 How to Edit Engagement Thresholds**

**📍 Location:** `components/trending-topics.tsx` (lines 300-334)

```typescript
const getEngagementColor = (score: number, platform: string = 'default') => {
  const thresholds = {
    reddit: { viral: 1000, high: 500, medium: 100 },
    twitter: { viral: 5000, high: 1000, medium: 100 },
    tiktok: { viral: 10000, high: 5000, medium: 1000 },
    instagram: { viral: 10000, high: 5000, medium: 1000 },
    default: { viral: 1000, high: 500, medium: 100 }
  }
  // Edit the numbers above to adjust thresholds
}
```

## 🎯 API Endpoints

### **Trending Data**

```bash
# Reddit trending posts
GET /api/trending/reddit?subreddit=programming&sort=hot&time=day&limit=10

# Twitter trending topics
GET /api/trending/twitter?query=AI&location=worldwide&limit=10

# TikTok trending content  
GET /api/trending/tiktok?hashtag=viral&limit=10

# Instagram trending posts ✨
GET /api/trending/instagram?hashtag=productivity&limit=10
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
curl "http://localhost:3000/api/trending/reddit?subreddit=programming&limit=5"
```

### **2. Instagram Trending** ✨

```bash
curl "http://localhost:3000/api/trending/instagram?hashtag=productivity&limit=5"
```

### **3. AI Content Generation**

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
import { useRedditTrending, useInstagramTrending, useContentGeneration } from '@/lib/api-hooks'

// Get Reddit trending data
const { data, loading, error, refetch } = useRedditTrending('programming', 'hot', 'day', 10)

// Get Instagram trending data ✨
const { data: igData, loading: igLoading } = useInstagramTrending('productivity', 10)

// Generate content ideas
const { generateContent } = useContentGeneration()
const ideas = await generateContent({
  topic: "React best practices",
  platform: "youtube",
  format: "video"
})
```

## 📊 What Works Now

### **✅ Fully Functional Features**

1. **✅ Real Reddit Data**: Live trending posts from any subreddit
2. **✅ Real Twitter Data**: Trending topics and hashtags
3. **✅ Real TikTok Data**: Trending videos and hashtags
4. **✅ Real Instagram Data**: Trending posts with hashtags ✨
5. **✅ AI Content Ideas**: OpenAI-powered content generation
6. **✅ Smart Engagement Labels**: Platform-aware viral/high/medium/low classification
7. **✅ Error Handling**: Graceful failures with retry buttons
8. **✅ Loading States**: Smooth UX with loading indicators
9. **✅ Usage Tracking**: Monitor API calls and costs
10. **✅ TypeScript Safety**: Fully typed with proper interfaces

### **🎨 UI Features**

- ✅ Real-time data updates across 4 platforms
- ✅ Platform-specific trending tabs (Reddit, Twitter, TikTok, Instagram)
- ✅ Color-coded engagement metrics (🔴 Viral, 🟠 High, 🟡 Medium, ⚪ Low)
- ✅ Instagram hashtags with "#" symbols
- ✅ Click-to-generate content ideas
- ✅ External links to original posts
- ✅ Responsive design
- ✅ Settings configuration panel

## 🛠️ Development

### **Adding New Platforms**

1. Create new API route in `app/api/trending/[platform]/route.ts`
2. Add types to `lib/types.ts` (e.g., `ApifyPlatformPost`)
3. Add platform thresholds in `components/trending-topics.tsx`
4. Add hook to `lib/api-hooks.ts`
5. Update UI component with new tab

### **Debugging**

```bash
# Check API logs
npm run dev

# Test specific endpoint
curl "http://localhost:3000/api/trending/reddit?limit=1"

# View usage stats
curl "http://localhost:3000/api/stats"

# Production build test
npm run build
```

## 🔧 Troubleshooting

### **Common Issues**

1. **"Missing environment variables"**: Add API keys to `.env.local`
2. **"Failed to fetch"**: Check Apify/OpenAI API key validity
3. **"No data returned"**: Try different parameters or check API limits
4. **TypeScript errors**: Run `npm run build` to check all types
5. **Engagement badges all black**: Fixed ✅ - now uses platform-aware thresholds
6. **Instagram hashtags missing #**: Fixed ✅ - now displays properly

### **API Limits**

- **Apify**: Usage-based pricing, generous free tier
- **OpenAI**: Pay-per-use, ~$0.002 per content generation
- **Rate Limiting**: Built-in retry logic and error handling

## 📈 Cost Estimates

- **Reddit API via Apify**: ~$0.00 per 10 posts (free tier)
- **Twitter API via Apify**: ~$0.02 per 10 trends  
- **TikTok API via Apify**: ~$0.03 per 10 videos
- **Instagram API via Apify**: ~$0.15 per 10 posts ✨
- **OpenAI Content Generation**: ~$0.002 per 5 ideas

**Daily cost for moderate usage**: < $2.00

## 🔄 Next Steps

### **Potential Enhancements**
- [ ] Content scheduling and publishing
- [ ] Analytics dashboard improvements  
- [ ] User preference learning
- [ ] Advanced filtering options
- [ ] Database integration (PostgreSQL)
- [ ] Caching layer (Redis)
- [ ] User authentication system

## 🎉 Current Status Summary

**The trending topic tracker is PRODUCTION READY:**

- 🚀 **4 Platforms Integrated**: Reddit, Twitter, TikTok, Instagram
- 🎯 **Smart Engagement Classification**: Platform-aware thresholds
- 💯 **TypeScript Complete**: Fully typed with proper interfaces
- 🐛 **Bug-Free**: All major issues resolved
- 📱 **Responsive UI**: Works on desktop and mobile
- ⚡ **Fast Performance**: Optimized build with no errors
- 🔧 **Developer Ready**: Clean code, documented APIs

**Ready to use for trending topic discovery and AI content generation!** 🎉