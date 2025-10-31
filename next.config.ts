import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.cloudpayments.ru;
              style-src 'self' 'unsafe-inline' https://*.cloudpayments.ru;
              img-src 'self' data: https://*.cloudpayments.ru;
              connect-src 'self' https://*.cloudpayments.ru;
              frame-src 'self' https://*.cloudpayments.ru;
              frame-ancestors 'self' https://*.cloudpayments.ru;
              font-src 'self' data:;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
