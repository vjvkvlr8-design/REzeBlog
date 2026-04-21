import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { serverIcons } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { adminRateLimiter } from '@/lib/security'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function isAuthenticated(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')
  if (!token) return false
  try {
    const decoded = Buffer.from(token.value, 'base64').toString()
    const [prefix, , pass] = decoded.split(':')
    return prefix === 'admin' && pass === process.env.ADMIN_PASSWORD
  } catch {
    return false
  }
}

// GET /api/admin/servers
export async function GET() {
  try {
    const icons = await db.select().from(serverIcons).orderBy(asc(serverIcons.orderIndex))
    return NextResponse.json(icons)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch server icons' }, { status: 500 })
  }
}

// POST /api/admin/servers
export async function POST(request: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const body = await request.json()
    const { name, iconUrl, linkUrl, isDiscordIcon, orderIndex } = body
    
    if (!name || !linkUrl) return NextResponse.json({ error: 'Name and LinkURL are required' }, { status: 400 })
    
    const result = await db.insert(serverIcons).values({
      name, iconUrl, linkUrl, 
      isDiscordIcon: isDiscordIcon || false,
      orderIndex: orderIndex || 0
    }).returning()
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create server icon' }, { status: 500 })
  }
}

// DELETE /api/admin/servers
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    await db.delete(serverIcons).where(eq(serverIcons.id, parseInt(id)))
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete server icon' }, { status: 500 })
  }
}
