// Client-side utility functions (safe for browser)

// Scan timestamp management
export const setLastScanTime = (timestamp: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastScanTime', timestamp)
  }
}

export const getLastScanTime = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastScanTime')
  }
  return null
}

// Format time ago
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const scanTime = new Date(timestamp)
  const diffMs = now.getTime() - scanTime.getTime()
  
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Future: Periodic scanning utilities
export const shouldScanDaily = (): boolean => {
  const lastScan = getLastScanTime()
  if (!lastScan) return true
  
  const now = new Date()
  const lastScanDate = new Date(lastScan)
  const diffHours = (now.getTime() - lastScanDate.getTime()) / (1000 * 60 * 60)
  
  return diffHours >= 24
}

export const getNextScheduledScan = (): Date => {
  const lastScan = getLastScanTime()
  const nextScan = lastScan ? new Date(lastScan) : new Date()
  nextScan.setHours(nextScan.getHours() + 24)
  return nextScan
} 