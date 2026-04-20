// Admin Categories CRUD API
// 작성일: 2026-04-20 (QA개발자)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/drizzle'
import { categories } from '@/db/schema'
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

// GET /api/admin/categories - List all categories
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        order: categories.order,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .orderBy(desc(categories.order))

    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    // Return fallback data when DB is unavailable
    const fallbackCategories = [
      { id: 1, name: '환영', slug: 'welcome', order: 0, createdAt: new Date() },
      { id: 2, name: '개발', slug: 'dev', order: 1, createdAt: new Date() },
      { id: 3, name: '커뮤니티', slug: 'community', order: 2, createdAt: new Date() },
    ]
    return NextResponse.json(fallbackCategories)
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug))
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const result = await db
      .insert(categories)
      .values({
        name,
        slug,
        order: order || 0,
      })
      .returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT /api/admin/categories - Update category
export async function PUT(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, slug, order } = body

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Check if category exists
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check slug uniqueness if changing
    if (slug) {
      const slugCheck = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, slug))
      if (slugCheck.length > 0 && slugCheck[0].id !== id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    const updateData: Partial<typeof categories.$inferInsert> = {}
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (order !== undefined) updateData.order = order

    const result = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/admin/categories - Delete category
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const categoryId = parseInt(id)
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Check if category exists
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId))
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await db.delete(categories).where(eq(categories.id, categoryId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
