// Admin Channels CRUD API
// 작성일: 2026-04-19 (Antigravity)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/drizzle'
import { channels, categories } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

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

// GET /api/admin/channels - List all channels with category info
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allChannels = await db
      .select({
        id: channels.id,
        name: channels.name,
        slug: channels.slug,
        categoryId: channels.categoryId,
        order: channels.order,
        createdAt: channels.createdAt,
        categoryName: categories.name,
      })
      .from(channels)
      .leftJoin(categories, eq(channels.categoryId, categories.id))
      .orderBy(desc(channels.order))

    return NextResponse.json(allChannels)
  } catch (error) {
    console.error('Failed to fetch channels:', error)
    // Return fallback data when DB is unavailable
    const fallbackChannels = [
      { id: 1, name: '환영합니다', slug: 'welcome', categoryId: 1, categoryName: '▼ 환영', order: 0, createdAt: new Date() },
      { id: 2, name: '공지사항', slug: 'announcements', categoryId: 1, categoryName: '▼ 환영', order: 1, createdAt: new Date() },
      { id: 3, name: 'Next.js 팁', slug: 'nextjs-tips', categoryId: 2, categoryName: '▼ 개발', order: 0, createdAt: new Date() },
      { id: 4, name: '인터랙티브 스토리', slug: 'interactive-story', categoryId: 2, categoryName: '▼ 개발', order: 1, createdAt: new Date() },
      { id: 5, name: 'SEO 전략', slug: 'seo-strategy', categoryId: 2, categoryName: '▼ 개발', order: 2, createdAt: new Date() },
      { id: 6, name: '일반', slug: 'general', categoryId: 3, categoryName: '▼ 커뮤니티', order: 0, createdAt: new Date() },
      { id: 7, name: '질문과 답변', slug: 'qna', categoryId: 3, categoryName: '▼ 커뮤니티', order: 1, createdAt: new Date() },
    ]
    return NextResponse.json(fallbackChannels)
  }
}

// POST /api/admin/channels - Create new channel
export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, categoryId, order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await db.select({ id: channels.id }).from(channels).where(eq(channels.slug, slug))
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const result = await db
      .insert(channels)
      .values({
        name,
        slug,
        categoryId: categoryId || null,
        order: order || 0,
      })
      .returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}

// PUT /api/admin/channels - Update channel
export async function PUT(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, slug, categoryId, order } = body

    if (!id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    // Check if channel exists
    const existing = await db.select({ id: channels.id }).from(channels).where(eq(channels.id, id))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check slug uniqueness if changing
    if (slug) {
      const slugCheck = await db
        .select({ id: channels.id })
        .from(channels)
        .where(eq(channels.slug, slug))
      if (slugCheck.length > 0 && slugCheck[0].id !== id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    const updateData: Partial<typeof channels.$inferInsert> = {}
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (order !== undefined) updateData.order = order

    const result = await db.update(channels).set(updateData).where(eq(channels.id, id)).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update channel:', error)
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
  }
}

// DELETE /api/admin/channels - Delete channel
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    const channelId = parseInt(id)
    if (isNaN(channelId)) {
      return NextResponse.json({ error: 'Invalid channel ID' }, { status: 400 })
    }

    // Check if channel exists
    const existing = await db.select({ id: channels.id }).from(channels).where(eq(channels.id, channelId))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    await db.delete(channels).where(eq(channels.id, channelId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}
