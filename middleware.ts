import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const decoded = decodeURIComponent(pathname);
  const rawPath = request.nextUrl.pathname;

  // Перехватываем любые варианты "[object Object]"
  // Проверяем и закодированный, и декодированный путь
  if (
    decoded.includes('[object Object]') ||
    rawPath.includes('%5Bobject%20Object%5D') ||
    rawPath.includes('[object') ||
    rawPath === '/[object Object]' ||
    rawPath === '/%5Bobject%20Object%5D'
  ) {
    console.log(`[Middleware] Redirecting ${rawPath} to /payment/success`);
    const url = request.nextUrl.clone();
    url.pathname = '/payment/success';
    url.search = '';
    return NextResponse.redirect(url, 302);
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


