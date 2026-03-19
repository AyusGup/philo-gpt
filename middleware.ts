import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './lib/logger';

export function middleware(request: NextRequest) {
  const { method, nextUrl, headers } = request;
  const path = nextUrl.pathname;
  const ip = headers.get('x-forwarded-for') || '127.0.0.1';

  // Morgan-like logging for API routes
  if (path.startsWith('/api')) {
    const userAgent = headers.get('user-agent') || 'unknown';
    
    // Log basic request info
    logger.info(`[REQ] ${method} ${path}`, {
      ip,
      userAgent: userAgent.slice(0, 30) + '...',
    });
  }

  return NextResponse.next();
}

// Ensure middleware only runs on API routes to avoid cluttering page loads
export const config = {
  matcher: '/api/:path*',
};
