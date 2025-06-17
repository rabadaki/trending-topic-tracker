# 🚀 Deployment Guide - Trending Topic Tracker

This guide covers deploying your production-ready trending topic tracker to various platforms.

## ✅ **Pre-Deployment Checklist**

- ✅ **Production Build Tested**: `npm run build` completes without errors
- ✅ **Environment Variables Ready**: You have `APIFY_API_TOKEN` and `OPENAI_API_KEY`
- ✅ **Code is Clean**: All debug logs removed, no temporary files
- ✅ **TypeScript Compliant**: Fully typed with no type errors

## 🏆 **Option 1: Vercel (Recommended)**

### **Why Vercel?**
- ✅ **Next.js Optimized**: Built specifically for Next.js apps
- ✅ **Zero Config**: Automatic deployments from Git
- ✅ **Edge Functions**: API routes deployed globally
- ✅ **Free Tier**: Generous limits for small projects
- ✅ **Custom Domains**: Easy domain setup

### **Deploy Steps:**

1. **Push to GitHub** (if not already):
```bash
git add .
git commit -m "Production ready - trending topic tracker"
git push origin main
```

2. **Deploy with Vercel**:
```bash
# Login to Vercel
vercel login

# Deploy from current directory
vercel

# Follow prompts:
# - Link to existing project? N
# - What's your project's name? trending-topic-tracker
# - In which directory? ./
# - Want to override settings? N
```

3. **Set Environment Variables**:
```bash
# Add your API keys to Vercel
vercel env add APIFY_API_TOKEN
vercel env add OPENAI_API_KEY

# Redeploy with environment variables
vercel --prod
```

4. **Custom Domain** (Optional):
```bash
vercel domains add yourdomain.com
```

### **Vercel Web Dashboard Alternative:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Add environment variables in dashboard
5. Deploy automatically

---

## 🌊 **Option 2: Netlify**

### **Deploy Steps:**

1. **Build Configuration**:
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy**:
- Go to [netlify.com](https://netlify.com)
- Connect GitHub repository
- Set environment variables
- Deploy

---

## ☁️ **Option 3: Railway**

### **Deploy Steps:**

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Deploy**:
```bash
railway login
railway init
railway up
```

3. **Add Environment Variables**:
```bash
railway variables set APIFY_API_TOKEN=your_token
railway variables set OPENAI_API_KEY=your_key
```

---

## 🐳 **Option 4: Docker + Any Cloud**

### **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### **Build and Deploy**:
```bash
# Build Docker image
docker build -t trending-topic-tracker .

# Run locally to test
docker run -p 3000:3000 \
  -e APIFY_API_TOKEN=your_token \
  -e OPENAI_API_KEY=your_key \
  trending-topic-tracker

# Deploy to any cloud platform that supports Docker
```

---

## 🔧 **Environment Variables Setup**

### **Required Variables:**
```bash
APIFY_API_TOKEN=your_apify_token_here
OPENAI_API_KEY=your_openai_key_here
```

### **Optional Variables:**
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### **Where to Add Environment Variables:**

**Vercel:**
- Dashboard → Project → Settings → Environment Variables
- Or via CLI: `vercel env add VARIABLE_NAME`

**Netlify:**
- Dashboard → Site → Site Settings → Environment Variables

**Railway:**
- Dashboard → Project → Variables
- Or via CLI: `railway variables set VARIABLE_NAME=value`

---

## 📊 **Post-Deployment Verification**

### **Test All Endpoints:**
```bash
# Replace YOUR_DOMAIN with your deployed URL
export DOMAIN="https://your-app.vercel.app"

# Test Reddit API
curl "$DOMAIN/api/trending/reddit?subreddit=programming&limit=1"

# Test Twitter API  
curl "$DOMAIN/api/trending/twitter?query=AI&limit=1"

# Test TikTok API
curl "$DOMAIN/api/trending/tiktok?hashtag=viral&limit=1"

# Test Instagram API
curl "$DOMAIN/api/trending/instagram?hashtag=productivity&limit=1"

# Test AI Content Generation
curl -X POST "$DOMAIN/api/generate/content" \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI tools","platform":"youtube","count":3}'

# Test Stats
curl "$DOMAIN/api/stats"
```

### **Verify UI Features:**
- ✅ All 4 platform tabs work (Reddit, Twitter, TikTok, Instagram)
- ✅ Scan button functions properly
- ✅ Engagement badges show correct colors
- ✅ Instagram hashtags display with "#" 
- ✅ Generate Ideas buttons work
- ✅ External links open correctly

---

## 💰 **Cost Estimates (Production)**

### **Hosting Costs:**
- **Vercel Free**: 0-100GB bandwidth, 100GB-hours compute
- **Vercel Pro**: $20/month per user (unlimited bandwidth)
- **Netlify Free**: 100GB bandwidth, 300 build minutes
- **Railway**: $5-20/month depending on usage

### **API Costs:**
- **Apify**: ~$2-10/month for moderate usage
- **OpenAI**: ~$5-20/month for content generation

**Total Monthly Cost: $10-50** depending on usage and hosting tier.

---

## 🔒 **Security Considerations**

### **Environment Variables:**
- ✅ Never commit API keys to Git
- ✅ Use platform-specific environment variable systems
- ✅ Rotate API keys periodically

### **Rate Limiting:**
- ✅ Built-in Apify rate limiting
- ✅ OpenAI automatic rate limiting
- ✅ Consider adding custom rate limiting for high traffic

### **CORS & API Security:**
- ✅ Next.js API routes are server-side only
- ✅ No client-side API key exposure
- ✅ Built-in CSRF protection

---

## 🚀 **Quick Deploy (Vercel - 5 Minutes)**

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy
vercel

# 3. Add environment variables
vercel env add APIFY_API_TOKEN
vercel env add OPENAI_API_KEY

# 4. Deploy to production
vercel --prod

# 🎉 Your app is live!
```

**Your trending topic tracker will be live at a URL like:**
`https://trending-topic-tracker-abc123.vercel.app`

---

## 📞 **Support & Monitoring**

### **Monitoring Tools:**
- **Vercel Analytics**: Built-in performance monitoring
- **Uptime Monitoring**: Use services like Uptime Robot
- **Error Tracking**: Consider Sentry for error monitoring

### **Logs & Debugging:**
- **Vercel**: View logs in dashboard or `vercel logs`
- **Railway**: `railway logs`
- **Netlify**: Function logs in dashboard

**Your trending topic tracker is ready for production deployment!** 🎉 