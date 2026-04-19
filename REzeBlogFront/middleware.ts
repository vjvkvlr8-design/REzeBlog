// Security Middleware - CSP, Rate Limiting
// 작성일: 2026-04-18

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting (Redis recommended for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per minute
const API_RATE_LIMIT_MAX = 30 // API requests per minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function isRateLimited(key: string, isAPI: boolean): boolean {
  const now = Date.now()
  const maxRequests = isAPI ? API_RATE_LIMIT_MAX : RATE_LIMIT_MAX
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return false
  }
  
  if (current.count >= maxRequests) {
    return true
  }
  
  current.count++
  return false
}

// Clean up old entries inline (Edge Runtime does not support setInterval)
function cleanupRateLimitMap() {
  const now = Date.now()
  // Only clean up if map is getting large
  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    })
  }
}

export function middleware(request: NextRequest) {
  // Inline cleanup instead of setInterval (Edge Runtime compatible)
  cleanupRateLimitMap()

  // ========== ADMIN ROUTE PROTECTION ==========
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAdminLogin = request.nextUrl.pathname === '/admin/login'
  const isAdminAPI = request.nextUrl.pathname.startsWith('/api/admin')
  
  if (isAdminRoute && !isAdminLogin) {
    // 어드민 페이지 접근 시 인증 확인
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 토큰 검증
    try {
      const decoded = Buffer.from(adminToken, 'base64').toString()
      const [prefix] = decoded.split(':')
      if (prefix !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  const response = NextResponse.next()
  const clientIP = getClientIP(request)
  const isAPI = request.nextUrl.pathname.startsWith('/api/')
  
  // Rate limiting check
  const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`
  if (isRateLimited(rateLimitKey, isAPI)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    )
  }
  
  // Security Headers - CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim()
  
  // Apply security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (HTTPS Strict Transport Security)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  
  // Cache control for static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // API cache control
  if (isAPI) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }
  
  return response
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
