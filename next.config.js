/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force fresh builds - disable all caching
  swcMinify: false,
  generateBuildId: async () => {
    // Generate unique build ID to force cache invalidation
    return 'build-' + Date.now()
  },
  // Force rebuild of API routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable webpack caching for server builds
      config.cache = false
    }
    return config
  }
}

module.exports = nextConfig 