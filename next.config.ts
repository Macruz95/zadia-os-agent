import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix Next.js workspace root warning
  outputFileTracingRoot: __dirname,
  
  // ESLint configuration for Next.js plugin detection
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeServerReact: true,
  },
  
  // Configure webpack for better optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Resolve client-side modules properly
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Optimize static generation
  staticPageGenerationTimeout: 60, // Reduced to 1 minute
  
  // Better compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable server-side compilation for specific modules that cause issues
  transpilePackages: ['react-i18next', 'i18next'],
};

export default nextConfig;
