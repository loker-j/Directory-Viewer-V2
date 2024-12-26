/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'mlckq.top'],
  },
  experimental: {
    serverActions: true,
    serverActions: {
      timeout: 300000 // 5 minutes
    }
  },
}

module.exports = config 