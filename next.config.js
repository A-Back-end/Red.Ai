/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable for Docker production builds
  // Disable static generation for Docker builds with test keys
  experimental: {
    staticWorkerRequestDeduping: false,
  },
  // Allow build to continue with ESLint warnings (errors will still fail)
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // ignoreDuringBuilds: true,
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
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://redai.site' : 'http://localhost:3000'),
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