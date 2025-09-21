/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    // ❌ Don't run ESLint during builds
    ignoreDuringBuilds: true
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true
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
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://46.101.97.43'}/:path*`
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/landpage',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/landpage',
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
