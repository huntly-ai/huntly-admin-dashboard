// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para o Prisma funcionar no Vercel
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  turbopack: {}, // Empty config to silence turbopack warning
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()]
    }
    return config
  },

  output: 'standalone',
}

module.exports = nextConfig
