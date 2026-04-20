// Security Middleware - CSP, Rate Limiting, Bot Protection
// 작성일: 2026-04-18
// 보안강화: 2026-04-20 - Meta/Facebook 크롤러 공격 대응

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ========== BOT PROTECTION ==========
// Known aggressive crawlers that can cause billing spikes
const BLOCKED_USER_AGENTS = [
  'facebookexternalhit',  // Meta crawler that caused $2,400 bill
  'Facebot',
  'MetaCrawler',
  'Bytespider',           // ByteDance crawler
  'Amazonbot',            // Amazon crawler
  'ClaudeBot',            // Anthropic crawler
  'GPTBot',               // OpenAI crawler
  'CCBot',                // Common Crawl
  'ChatGPT-User',
  'Google-Extended',      // Google AI crawler
]

const SUSPICIOUS_PATTERNS = [
  /curl\//i,
  /wget\//i,
  /python-requests\//i,
  /scrapy\//i,
  /bot\//i,
  /crawler\//i,
  /spider\//i,
]

// Simple in-memory rate limiting (Redis recommended for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const botBlockMap = new Map<string, { blocked: boolean; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 20 // Reduced from 100 to prevent crawler abuse
const API_RATE_LIMIT_MAX = 15 // Reduced from 30
const BOT_BLOCK_WINDOW = 60 * 60 * 1000 // 1 hour block for bots

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

// ========== BOT DETECTION & BLOCKING ==========
function isBotBlocked(ip: string): boolean {
  const now = Date.now()
  const blockInfo = botBlockMap.get(ip)
  
  if (blockInfo && blockInfo.blocked) {
    if (now < blockInfo.resetTime) {
      return true
    } else {
      botBlockMap.delete(ip)
    }
  }
  return false
}

function blockBot(ip: string): void {
  botBlockMap.set(ip, {
    blocked: true,
    resetTime: Date.now() + BOT_BLOCK_WINDOW,
  })
}

function isSuspiciousBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  
  // Check blocked user agents
  for (const bot of BLOCKED_USER_AGENTS) {
    if (ua.includes(bot.toLowerCase())) {
      return true
    }
  }
  
  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true
    }
  }
  
  return false
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

  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''

  // ========== BOT DETECTION & BLOCKING ==========
  // Check if IP is already blocked
  if (isBotBlocked(clientIP)) {
    return new NextResponse(
      JSON.stringify({ error: 'Access denied. Bot detected.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Detect and block suspicious bots
  if (isSuspiciousBot(userAgent)) {
    blockBot(clientIP)
    console.warn(`🚫 Blocked bot: ${userAgent.substring(0, 50)} from IP: ${clientIP}`)
    return new NextResponse(
      JSON.stringify({ error: 'Access denied. Suspicious bot detected.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

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
  const isAPI = request.nextUrl.pathname.startsWith('/api/')
  
  // Rate limiting check
  const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`
  if (isRateLimited(rateLimitKey, isAPI)) {
    // Block IP if rate limit exceeded (possible bot)
    blockBot(clientIP)
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Access temporarily blocked.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3600',
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
