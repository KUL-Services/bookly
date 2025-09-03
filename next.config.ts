import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ['127.0.0.0', 'localhost'],
  basePath: process.env.BASEPATH,
  images: {
    remotePatterns: [
      new URL('https://gratisography.com/**'),

      //TODO: REMOVE THIS BEFORE DEPLOYMENT
      {
        protocol: 'https',
        hostname: '**' // allow all hosts
      },
      {
        protocol: 'http',
        hostname: '**' // allow all hosts over http
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/admin/dashboards/crm',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/admin/dashboards/crm',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
  /* config options here */
}

export default nextConfig
