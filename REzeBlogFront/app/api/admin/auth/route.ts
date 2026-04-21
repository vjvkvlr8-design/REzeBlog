// Admin 인증 API - httpOnly 쿠키 기반
// 프론트엔드에서 접근 불가능한 보안 토큰 사용
// 작성일: 2026-04-19 (Antigravity)

import { NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (password !== ADMIN_PASSWORD) {
      // 무차별 대입 방지: 일부러 느리게 응답
      await new Promise(r => setTimeout(r, 1000))
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // 인증 성공 - httpOnly 쿠키 설정 (프론트에서 JS로 접근 불가)
    const token = Buffer.from(`admin:${Date.now()}:${ADMIN_PASSWORD}`).toString('base64')
    
    const response = NextResponse.json({ success: true })
    
    // Legacy Admin Token
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Universal Auth Token for Level 0 Admin
    const authJwt = createToken({ nickname: '관리자', level: 0 })
    response.cookies.set('auth_token', authJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    
    return response
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE() {
  // 로그아웃
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  response.cookies.delete('auth_token')
  return response
}
