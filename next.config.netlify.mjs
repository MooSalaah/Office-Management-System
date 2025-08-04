/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا نستخدم output: export لأن لدينا API routes
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['localhost', 'netlify.app']
  },
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  }
}

export default nextConfig 