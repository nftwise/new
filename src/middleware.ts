// Middleware for authentication and authorization
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow run-rollup API with cron secret (for backfill scripts)
  if (pathname === '/api/admin/run-rollup') {
    // Check Authorization header for cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return NextResponse.next()
    }
    // For POST requests, we need to allow the request to proceed
    // and let the route handler check the secret in body
    if (request.method === 'POST') {
      return NextResponse.next()
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If accessing admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Check if user is authenticated
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
  }

  // If accessing client routes (but not login/signup)
  if (pathname.startsWith('/client') || pathname.startsWith('/api/client-dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If accessing ads-analysis (requires authentication)
  if (pathname.startsWith('/ads-analysis') || pathname.startsWith('/api/ads-analysis')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/client/:path*',
    '/api/client-dashboard/:path*',
    '/ads-analysis/:path*',
    '/api/ads-analysis/:path*',
  ]
}
