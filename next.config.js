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

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
