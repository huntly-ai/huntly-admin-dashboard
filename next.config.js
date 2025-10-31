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

  // Usar output standalone para otimização no Vercel
  output: 'standalone',
  
  // Garantir que os arquivos .node sejam incluídos
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/*.node', './node_modules/@prisma/client/*.node'],
  },
}

module.exports = nextConfig
