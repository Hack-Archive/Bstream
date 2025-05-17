/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
  webpack: (config, { dev, isServer }) => {
    // This is necessary to handle the 'self is not defined' error with jose library
    if (isServer) {
      // Ensure jose library runs correctly in Node.js environment
      if (!config.resolve) config.resolve = {};
      if (!config.resolve.fallback) config.resolve.fallback = {};
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Polyfill for browser globals in Node.js environment
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        // Add other polyfills as needed
      };
    }
    
    // Explicitly mark jose as a client-side only package
    if (isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // This ensures jose doesn't try to run in a Node.js environment
        if (entries['pages/api/auth/[...nextauth]']) {
          entries['pages/api/auth/[...nextauth]'] = entries['pages/api/auth/[...nextauth]'].filter(
            (entry) => !entry.includes('node_modules/jose/')
          );
        }
        
        return entries;
      };
    }
    
    if (dev && !isServer) {
      config.performance = {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
      };
    }
    
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

export default nextConfig