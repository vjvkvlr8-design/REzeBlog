import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json()

    if (!nickname || !password) {
      return NextResponse.json({ error: '닉네임과 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const targetUser = await db.select().from(users).where(eq(users.nickname, nickname)).limit(1)
    
    if (targetUser.length === 0) {
      return NextResponse.json({ error: '존재하지 않는 닉네임입니다.' }, { status: 401 })
    }

    const hashedPassword = hashPassword(password)
    if (targetUser[0].password !== hashedPassword) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // Sign token
    const token = createToken({ nickname: targetUser[0].nickname, level: targetUser[0].level })

    const response = NextResponse.json({ success: true, user: { nickname, level: targetUser[0].level } })
    
    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 로그아웃 (토큰 삭제)
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth_token')
  response.cookies.delete('admin_token') // 혹시 모를 관리자 토큰도 함께 삭제
  return response
}
