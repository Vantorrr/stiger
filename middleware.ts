import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const decoded = decodeURIComponent(pathname);

  // Любой заход на путь, содержащий "[object Object]" → на /payment/success
  if (decoded.includes('[object Object]')) {
    const url = request.nextUrl.clone();
    url.pathname = '/payment/success';
    url.search = '';
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


