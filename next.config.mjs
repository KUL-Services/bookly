/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    // ❌ Don't run ESLint during builds
    ignoreDuringBuilds: true
  },
  allowedDevOrigins: ['127.0.0.0', 'localhost'],
  transpilePackages: ['geist'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gratisography.com',
        pathname: '/**'
      },
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
        destination: '/en/dashboards/crm',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/dashboards/crm',
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
}

export default nextConfig
