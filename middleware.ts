import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Обходим Vercel Security Checkpoint для CloudPayments webhook
  if (request.nextUrl.pathname.startsWith('/api/webhooks/cloudpayments')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/webhooks/cloudpayments/:path*'
  ]
};

