import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { visitors, posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

// POST /api/visitor - Track a visitor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { page, referrer, duration } = body

    // Get IP and user agent from headers
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
    const userAgent = headers.get('user-agent') || 'unknown'

    // Extract keyword from referrer if available
    let keyword: string | null = null
    if (referrer) {
      try {
        const refUrl = new URL(referrer)
        // Check for search engines
        if (refUrl.hostname.includes('google')) {
          keyword = refUrl.searchParams.get('q') || 'google'
        } else if (refUrl.hostname.includes('naver')) {
          keyword = refUrl.searchParams.get('query') || 'naver'
        }
      } catch {
        // Invalid URL, ignore
      }
    }

    // Insert visitor record
    const visitor = await db
      .insert(visitors)
      .values({
        ip: ip.toString().split(',')[0].trim(), // Get first IP if multiple
        referrer: referrer || null,
        keyword,
        userAgent: userAgent.substring(0, 500), // Limit length
        pages: page ? [page] : [],
        duration: duration || null,
      })
      .returning()

    // If viewing a post, increment view count
    if (page && page.startsWith('/blog/')) {
      const slug = page.replace('/blog/', '').split('?')[0]
      const post = await db
        .select({ id: posts.id, views: posts.views })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1)

      if (post.length > 0) {
        await db
          .update(posts)
          .set({ views: post[0].views + 1 })
          .where(eq(posts.id, post[0].id))
      }
    }

    return NextResponse.json({ success: true, visitor: visitor[0] }, { status: 201 })
  } catch (error) {
    console.error('Failed to track visitor:', error)
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    )
  }
}

// GET /api/visitor/stats - Get visitor statistics (admin only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '24h'

    // Simple stats for now - can be expanded
    const allVisitors = await db.select().from(visitors)

    // Calculate stats
    const now = new Date()
    const periodHours = period === '24h' ? 24 : period === '7d' ? 168 : 720
    const cutoff = new Date(now.getTime() - periodHours * 60 * 60 * 1000)

    const recentVisitors = allVisitors.filter(v => new Date(v.createdAt) > cutoff)

    const stats = {
      total: allVisitors.length,
      recent: recentVisitors.length,
      uniqueIps: new Set(recentVisitors.map(v => v.ip)).size,
      topReferrers: {} as Record<string, number>,
      topKeywords: {} as Record<string, number>,
    }

    // Calculate referrer stats
    recentVisitors.forEach(v => {
      if (v.referrer) {
        try {
          const hostname = new URL(v.referrer).hostname
          stats.topReferrers[hostname] = (stats.topReferrers[hostname] || 0) + 1
        } catch {
          // Invalid URL
        }
      }
      if (v.keyword) {
        stats.topKeywords[v.keyword] = (stats.topKeywords[v.keyword] || 0) + 1
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to get visitor stats:', error)
    return NextResponse.json(
      { error: 'Failed to get visitor stats' },
      { status: 500 }
    )
  }
}
