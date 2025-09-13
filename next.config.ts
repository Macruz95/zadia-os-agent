import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  
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
  staticPageGenerationTimeout: 180, // Increase timeout to 3 minutes
  
  // Configure output
  output: 'standalone',
  
  // Disable server-side compilation for specific modules that cause issues
  transpilePackages: ['react-i18next', 'i18next'],
};

export default nextConfig;
