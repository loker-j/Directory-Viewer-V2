/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用边缘运行时，以支持更快的响应
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // 允许跨域资源共享
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  env: {
    NEXT_PUBLIC_BLOB_PUBLIC_URL: process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN
  },
  // 禁用严格模式以减少开发时的双重渲染
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 