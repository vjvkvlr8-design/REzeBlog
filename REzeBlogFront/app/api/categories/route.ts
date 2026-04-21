import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { categories, channels, posts } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

// GET /api/categories - Fetch all categories with their channels
export async function GET() {
  try {
    // Fetch categories ordered by order field
    const cats = await db.select().from(categories).orderBy(asc(categories.order))
    
    // Fetch all channels
    const chans = await db.select().from(channels).orderBy(asc(channels.order))
    
    // Fetch all posts to count them per channel
    const allPosts = await db.select({ channelId: posts.channelId }).from(posts).where(eq(posts.published, true))
    
    // Group channels by category and attach post counts
    const result = cats.map((cat) => ({
      ...cat,
      channels: chans
        .filter((ch) => ch.categoryId === cat.id)
        .map((ch) => ({
          ...ch,
          postCount: allPosts.filter(p => p.channelId === ch.id).length
        })),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'DB Connection Failed' }, { status: 500 })
  }
}
