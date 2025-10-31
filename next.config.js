/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudpayments.ru",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.cloudpayments.ru wss://*.cloudpayments.ru",
              "frame-src 'self' https://*.cloudpayments.ru https://stiger.app",
              "frame-ancestors 'self' https://*.cloudpayments.ru"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

