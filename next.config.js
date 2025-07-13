/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable for Docker production builds
  // Disable static generation for Docker builds with test keys
  experimental: {
    staticWorkerRequestDeduping: false,
  },
  // Skip problematic pages during static generation
  ...((process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('Y2xlcmsuZGV2ZWxvcG1lbnQ') || 
       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) && {
    exportPathMap: async function (defaultPathMap) {
      return {
        '/': { page: '/' }
      }
    }
  }),
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['images.unsplash.com', 'oaidalleapiprodscus.blob.core.windows.net'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig; 