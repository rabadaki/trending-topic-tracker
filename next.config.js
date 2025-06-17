/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate unique build ID to force cache invalidation
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig 