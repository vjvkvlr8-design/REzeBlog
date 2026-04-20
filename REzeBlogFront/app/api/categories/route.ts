import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { categories, channels } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

// Fallback data when DB is unavailable
const FALLBACK_CATEGORIES = [
  {
    id: 1,
    name: '▼ 환영',
    slug: 'welcome',
    order: 0,
    createdAt: new Date(),
    channels: [
      { id: 1, name: '환영합니다', slug: 'welcome', categoryId: 1, order: 0, createdAt: new Date() },
      { id: 2, name: '공지사항', slug: 'announcements', categoryId: 1, order: 1, createdAt: new Date() },
    ]
  },
  {
    id: 2,
    name: '▼ 개발',
    slug: 'dev',
    order: 1,
    createdAt: new Date(),
    channels: [
      { id: 3, name: 'Next.js 팁', slug: 'nextjs-tips', categoryId: 2, order: 0, createdAt: new Date() },
      { id: 4, name: '인터랙티브 스토리', slug: 'interactive-story', categoryId: 2, order: 1, createdAt: new Date() },
      { id: 5, name: 'SEO 전략', slug: 'seo-strategy', categoryId: 2, order: 2, createdAt: new Date() },
    ]
  },
  {
    id: 3,
    name: '▼ 커뮤니티',
    slug: 'community',
    order: 2,
    createdAt: new Date(),
    channels: [
      { id: 6, name: '일반', slug: 'general', categoryId: 3, order: 0, createdAt: new Date() },
      { id: 7, name: '질문과 답변', slug: 'qna', categoryId: 3, order: 1, createdAt: new Date() },
    ]
  }
]

// GET /api/categories - Fetch all categories with their channels
export async function GET() {
  try {
    // Fetch categories ordered by order field
    const cats = await db.select().from(categories).orderBy(asc(categories.order))
    
    // Fetch all channels
    const chans = await db.select().from(channels).orderBy(asc(channels.order))
    
    // Group channels by category
    const result = cats.map((cat) => ({
      ...cat,
      channels: chans.filter((ch) => ch.categoryId === cat.id),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    // Return fallback data instead of error to prevent empty UI
    return NextResponse.json(FALLBACK_CATEGORIES)
  }
}
