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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.cloudpayments.ru https://api.cloudpayments.ru https://intent-api.cloudpayments.ru",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: https://widget.cloudpayments.ru https://ads.cloudpayments.ru",
              "font-src 'self' data:",
              "connect-src 'self' https://widget.cloudpayments.ru https://api.cloudpayments.ru https://intent-api.cloudpayments.ru wss://widget.cloudpayments.ru",
              "frame-src 'self' https://widget.cloudpayments.ru https://stiger.app",
              "frame-ancestors 'self' https://widget.cloudpayments.ru"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

