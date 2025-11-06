import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/[object Object]' || pathname === '/%5Bobject%20Object%5D') {
    const url = request.nextUrl.clone();
    url.pathname = '/payment/success';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/api/webhooks/cloudpayments')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/:path*'
  ]
};


