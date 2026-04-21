import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = getAuthUser()
    
    if (user) {
      return NextResponse.json({ authenticated: true, user })
    } else {
      return NextResponse.json({ authenticated: false, user: null })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
