import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json()

    if (!nickname || !password) {
      return NextResponse.json({ error: '닉네임과 비밀번호를 모두 입력해주세요.' }, { status: 400 })
    }

    if (nickname === '관리자' || nickname.startsWith('게스트')) {
      return NextResponse.json({ error: '사용할 수 없는 닉네임입니다.' }, { status: 400 })
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.nickname, nickname)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: '이미 존재하는 닉네임입니다.' }, { status: 409 })
    }

    // Insert user
    const hashedPassword = hashPassword(password)
    const newUser = await db.insert(users).values({
      nickname,
      password: hashedPassword,
      level: 3,
    }).returning()

    // Sign token
    const token = createToken({ nickname: newUser[0].nickname, level: newUser[0].level })

    const response = NextResponse.json({ success: true, user: { nickname, level: 3 } }, { status: 201 })
    
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
    console.error('Registration error:', error)
    return NextResponse.json({ error: '회원가입 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
