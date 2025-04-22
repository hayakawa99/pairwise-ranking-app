/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // NextAuth のルートはそのままフロントエンドで処理
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      // それ以外の API だけバックエンドへ転送
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
