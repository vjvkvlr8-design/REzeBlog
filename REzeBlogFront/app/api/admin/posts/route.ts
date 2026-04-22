// Admin Posts CRUD API
// 작성일: 2026-04-19 (Antigravity)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/drizzle'
import { posts, channels } from '@/db/schema'
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

// GET /api/admin/posts - List all posts with channel info
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        author: posts.author,
        authorColor: posts.authorColor,
        avatarBg: posts.avatarBg,
        avatarLetter: posts.avatarLetter,
        channelId: posts.channelId,
        views: posts.views,
        published: posts.published,
        tags: posts.tags,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        channelName: channels.name,
      })
      .from(posts)
      .leftJoin(channels, eq(posts.channelId, channels.id))
      .orderBy(desc(posts.createdAt))

    return NextResponse.json(allPosts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/admin/posts - Create new post
export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      authorColor,
      avatarBg,
      avatarLetter,
      channelId,
      published,
      tags,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug))
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const result = await db
      .insert(posts)
      .values({
        title,
        slug,
        content,
        excerpt: excerpt || content.slice(0, 200),
        author: author || '관리자',
        authorColor: authorColor || '#5865f2',
        avatarBg: avatarBg || 'blue',
        avatarLetter: avatarLetter || 'A',
        channelId: channelId || null,
        published: published !== undefined ? published : true,
        tags: tags || null,
      })
      .returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

// PUT /api/admin/posts - Update post
export async function PUT(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      id,
      title,
      slug,
      content,
      excerpt,
      author,
      authorColor,
      avatarBg,
      avatarLetter,
      channelId,
      published,
      tags,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Check if post exists
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check slug uniqueness if changing
    if (slug) {
      const slugCheck = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug))
      if (slugCheck.length > 0 && slugCheck[0].id !== id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    const updateData: Partial<typeof posts.$inferInsert> = {}
    if (title) updateData.title = title
    if (slug) updateData.slug = slug
    if (content) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (author) updateData.author = author
    if (authorColor) updateData.authorColor = authorColor
    if (avatarBg) updateData.avatarBg = avatarBg
    if (avatarLetter) updateData.avatarLetter = avatarLetter
    if (channelId !== undefined) updateData.channelId = channelId
    if (published !== undefined) updateData.published = published
    if (tags !== undefined) updateData.tags = tags

    const result = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/admin/posts - Delete post
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Check if post exists
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await db.delete(posts).where(eq(posts.id, postId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
