// Security utilities
// 작성일: 2026-04-18

import { sql } from './db'

// API key validation
export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key')
  const validKey = process.env.API_SECRET_KEY
  
  if (!validKey) {
    console.warn('API_SECRET_KEY not set - allowing all requests')
    return true
  }
  
  return apiKey === validKey
}

// Input sanitization for SQL injection prevention
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[;\"'\\]/g, '')
    .trim()
    .slice(0, 1000) // Limit length
}

// XSS prevention for user-generated content
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Session validation
export async function validateSession(sessionId: string): Promise<boolean> {
  if (!sessionId || sessionId.length < 32) {
    return false
  }
  
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM user_logs 
        WHERE session_id = ${sessionId} 
        AND created_at > NOW() - INTERVAL '24 hours'
      ) as exists
    `
    return result[0]?.exists || false
  } catch {
    return false
  }
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Rate limiting for specific endpoints
export class RateLimiter {
  private requests: Map<string, number[]>
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.requests = new Map()
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const timestamps = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validTimestamps = timestamps.filter(
      time => now - time < this.windowMs
    )
    
    if (validTimestamps.length >= this.maxRequests) {
      return false
    }
    
    validTimestamps.push(now)
    this.requests.set(identifier, validTimestamps)
    return true
  }
}

// Admin API rate limiter (100 requests per 30 minutes per IP)
export const adminRateLimiter = new RateLimiter(30 * 60 * 1000, 100)

// Common security headers object
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
}
