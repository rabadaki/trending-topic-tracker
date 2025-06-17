// Settings utility functions for monitoring preferences

export interface MonitoringSettings {
  reddit: {
    subreddits: string[]
    keywords: string[]
    minUpvotes: number
    timeframe: '1h' | '24h' | '7d' | '30d'
  }
  twitter: {
    searchTerms: string[]
    accounts: string[]
    minEngagement: number
    language: string
  }
  tiktok: {
    hashtags: string[]
    trending_sounds: boolean
    minViews: number
    region: string
  }
  instagram: {
    hashtags: string[]
    accounts: string[]
    minLikes: number
    contentTypes: ('photo' | 'video' | 'carousel')[]
  }
}

export const DEFAULT_MONITORING_SETTINGS: MonitoringSettings = {
  reddit: {
    subreddits: ['productivity', 'contentcreator', 'entrepreneur'],
    keywords: ['productivity', 'contentcreator', 'entrepreneur'],
    minUpvotes: 10,
    timeframe: '24h'
  },
  twitter: {
    searchTerms: ['productivity', 'contentcreator', 'entrepreneur'],
    accounts: ['garyvee', 'mrbeast', 'hubspot'],
    minEngagement: 100,
    language: 'en'
  },
  tiktok: {
    hashtags: ['productivity', 'contentcreator', 'entrepreneur'],
    trending_sounds: true,
    minViews: 1000,
    region: 'global'
  },
  instagram: {
    hashtags: ['productivity', 'contentcreator', 'entrepreneur'],
    accounts: ['garyvee', 'mrbeast', 'hubspot'],
    minLikes: 100,
    contentTypes: ['photo', 'video', 'carousel']
  }
}

// Get monitoring settings from localStorage
export const getMonitoringSettings = (): MonitoringSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_MONITORING_SETTINGS
  }
  
  try {
    const stored = localStorage.getItem('monitoring-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults and enforce 3-item limits
      const merged = {
        reddit: { 
          ...DEFAULT_MONITORING_SETTINGS.reddit, 
          ...parsed.reddit,
          // Force lower thresholds to ensure results
          minUpvotes: Math.min(parsed.reddit?.minUpvotes || 100, 10)
        },
        twitter: { 
          ...DEFAULT_MONITORING_SETTINGS.twitter, 
          ...parsed.twitter,
          // Migrate hashtags to searchTerms if needed
          searchTerms: parsed.twitter?.searchTerms || parsed.twitter?.hashtags || DEFAULT_MONITORING_SETTINGS.twitter.searchTerms,
          // Force lower thresholds to ensure results
          minEngagement: Math.min(parsed.twitter?.minEngagement || 1000, 100)
        },
        tiktok: { 
          ...DEFAULT_MONITORING_SETTINGS.tiktok, 
          ...parsed.tiktok,
          // Force lower thresholds to ensure results
          minViews: Math.min(parsed.tiktok?.minViews || 10000, 1000)
        },
        instagram: { 
          ...DEFAULT_MONITORING_SETTINGS.instagram, 
          ...parsed.instagram,
          // Force lower thresholds to ensure results
          minLikes: Math.min(parsed.instagram?.minLikes || 1000, 100)
        }
      }
      // Always validate and limit to 3 items
      return validateMonitoringSettings(merged)
    }
  } catch (error) {
    console.error('Failed to parse monitoring settings:', error)
  }
  
  return DEFAULT_MONITORING_SETTINGS
}

// Save monitoring settings to localStorage
export const saveMonitoringSettings = (settings: MonitoringSettings) => {
  if (typeof window !== 'undefined') {
    try {
      // Always validate and limit to 3 items before saving
      const validatedSettings = validateMonitoringSettings(settings)
      localStorage.setItem('monitoring-settings', JSON.stringify(validatedSettings))
    } catch (error) {
      console.error('Failed to save monitoring settings:', error)
    }
  }
}

// Get search terms for a specific platform based on monitoring settings
export const getSearchTermsForPlatform = (platform: 'reddit' | 'twitter' | 'tiktok' | 'instagram'): string[] => {
  const settings = getMonitoringSettings()
  
  switch (platform) {
    case 'reddit':
      return [...settings.reddit.keywords]
    case 'twitter':
      return settings.twitter.searchTerms
    case 'tiktok':
      return settings.tiktok.hashtags.map(tag => `#${tag}`)
    case 'instagram':
      return settings.instagram.hashtags.map(tag => `#${tag}`)
    default:
      return []
  }
}

// Get platform-specific configuration
export const getPlatformConfig = (platform: 'reddit' | 'twitter' | 'tiktok' | 'instagram') => {
  const settings = getMonitoringSettings()
  return settings[platform]
}

// Validation functions to enforce 3-item limits
export const validateAndLimitArray = (arr: string[], maxItems: number = 3): string[] => {
  return arr.slice(0, maxItems)
}

export const validateMonitoringSettings = (settings: MonitoringSettings): MonitoringSettings => {
  return {
    reddit: {
      ...settings.reddit,
      subreddits: validateAndLimitArray(settings.reddit.subreddits, 3),
      keywords: validateAndLimitArray(settings.reddit.keywords, 3)
    },
    twitter: {
      ...settings.twitter,
      searchTerms: validateAndLimitArray(settings.twitter.searchTerms, 3),
      accounts: validateAndLimitArray(settings.twitter.accounts, 3)
    },
    tiktok: {
      ...settings.tiktok,
      hashtags: validateAndLimitArray(settings.tiktok.hashtags, 3)
    },
    instagram: {
      ...settings.instagram,
      hashtags: validateAndLimitArray(settings.instagram.hashtags, 3),
      accounts: validateAndLimitArray(settings.instagram.accounts, 3)
    }
  }
}

// Enhanced settings-based API parameter builders
export const buildRedditParams = () => {
  const settings = getMonitoringSettings()
  const config = settings.reddit
  return {
    subreddits: validateAndLimitArray(config.subreddits, 3),
    keywords: validateAndLimitArray(config.keywords, 3),
    minUpvotes: config.minUpvotes,
    timeframe: config.timeframe
  }
}

export const buildTwitterParams = () => {
  const settings = getMonitoringSettings()
  const config = settings.twitter
  return {
    searchTerms: validateAndLimitArray(config.searchTerms, 3),
    accounts: validateAndLimitArray(config.accounts, 3),
    minEngagement: config.minEngagement,
    language: config.language
  }
}

// Region display mapping with flags
export const TIKTOK_REGIONS = {
  // North America
  'us': '🇺🇸 United States',
  'ca': '🇨🇦 Canada', 
  'mx': '🇲🇽 Mexico',
  
  // Europe
  'uk': '🇬🇧 United Kingdom',
  'de': '🇩🇪 Germany',
  'fr': '🇫🇷 France',
  'it': '🇮🇹 Italy',
  'es': '🇪🇸 Spain',
  'nl': '🇳🇱 Netherlands',
  'se': '🇸🇪 Sweden',
  'no': '🇳🇴 Norway',
  'dk': '🇩🇰 Denmark',
  'fi': '🇫🇮 Finland',
  'pl': '🇵🇱 Poland',
  'ru': '🇷🇺 Russia',
  
  // Asia Pacific
  'jp': '🇯🇵 Japan',
  'kr': '🇰🇷 South Korea',
  'cn': '🇨🇳 China',
  'in': '🇮🇳 India',
  'id': '🇮🇩 Indonesia',
  'th': '🇹🇭 Thailand',
  'vn': '🇻🇳 Vietnam',
  'ph': '🇵🇭 Philippines',
  'my': '🇲🇾 Malaysia',
  'sg': '🇸🇬 Singapore',
  'au': '🇦🇺 Australia',
  'nz': '🇳🇿 New Zealand',
  
  // Middle East & Africa
  'ae': '🇦🇪 UAE',
  'sa': '🇸🇦 Saudi Arabia',
  'eg': '🇪🇬 Egypt',
  'za': '🇿🇦 South Africa',
  'ng': '🇳🇬 Nigeria',
  'ke': '🇰🇪 Kenya',
  
  // Latin America
  'br': '🇧🇷 Brazil',
  'ar': '🇦🇷 Argentina',
  'cl': '🇨🇱 Chile',
  'co': '🇨🇴 Colombia',
  'pe': '🇵🇪 Peru',
  
  // Global
  'global': '🌍 Global/Worldwide'
} as const

export const getTikTokRegionDisplay = (regionCode: string): string => {
  return TIKTOK_REGIONS[regionCode as keyof typeof TIKTOK_REGIONS] || regionCode.toUpperCase()
}

export const buildTikTokParams = () => {
  const settings = getMonitoringSettings()
  const config = settings.tiktok
  return {
    hashtags: validateAndLimitArray(config.hashtags, 3),
    trending_sounds: config.trending_sounds,
    minViews: config.minViews,
    region: config.region
  }
}

export const buildInstagramParams = () => {
  const settings = getMonitoringSettings()
  const config = settings.instagram
  return {
    hashtags: validateAndLimitArray(config.hashtags, 3),
    accounts: validateAndLimitArray(config.accounts, 3),
    minLikes: config.minLikes,
    contentTypes: config.contentTypes
  }
}

// Reset settings to defaults (useful for fixing validation issues)
export const resetMonitoringSettings = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('monitoring-settings')
    } catch (error) {
      console.error('Failed to reset monitoring settings:', error)
    }
  }
}

// Force validation of current settings (migrate old data)
export const migrateAndValidateSettings = () => {
  const currentSettings = getMonitoringSettings()
  saveMonitoringSettings(currentSettings)
  return currentSettings
} 