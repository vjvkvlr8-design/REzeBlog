import { cookies } from 'next/headers'
import crypto from 'crypto'

export interface AuthUser {
  nickname: string
  level: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'rezeblog_default_secret_key_123'

// Hash password (SHA-256)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Create a simple JWT token
export function createToken(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payload)
    .digest('base64')
  return `${payload}.${signature}`
}

// Verify a simple JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payload)
      .digest('base64')

    if (signature !== expectedSignature) return null

    const decoded = Buffer.from(payload, 'base64').toString('utf8')
    return JSON.parse(decoded) as AuthUser
  } catch (err) {
    return null
  }
}

// Get the current authenticated user from cookies
export function getAuthUser(): AuthUser | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')
    if (!token) return null
    return verifyToken(token.value)
  } catch {
    return null
  }
}
