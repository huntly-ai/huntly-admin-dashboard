import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  turbopack: {}, // Empty config to silence turbopack warning
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common')
    }
    return config
  },

  output: 'standalone',
};

export default nextConfig;
