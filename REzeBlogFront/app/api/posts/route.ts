import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { posts, comments } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

// GET /api/posts - Fetch all published posts with comment counts
export async function GET() {
  try {
    // Fetch all published posts
    const allPosts = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        author: posts.author,
        authorColor: posts.authorColor,
        avatarBg: posts.avatarBg,
        avatarLetter: posts.avatarLetter,
        views: posts.views,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))

    // Get comment counts for each post
    const postsWithReplies = await Promise.all(
      allPosts.map(async (post) => {
        const replyCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.postId, post.id))
          .then((res) => Number(res[0]?.count || 0))

        // Calculate relative time
        const now = new Date()
        const created = new Date(post.createdAt)
        const diffMs = now.getTime() - created.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        let lastActivity: string
        if (diffHours < 1) {
          lastActivity = '방금'
        } else if (diffHours < 24) {
          lastActivity = `${diffHours}시간 전`
        } else if (diffDays === 1) {
          lastActivity = '어제'
        } else if (diffDays < 7) {
          lastActivity = `${diffDays}일 전`
        } else {
          lastActivity = `${Math.floor(diffDays / 7)}주 전`
        }

        return {
          ...post,
          replyCount,
          lastActivity,
        }
      })
    )

    return NextResponse.json(postsWithReplies)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post (Public access for visitors)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, content, channelId } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Default visitor author identity
    const author = '방문자' + Math.floor(Math.random() * 1000)
    const authorColor = '#1abc9c'
    const avatarBg = 'teal'
    const avatarLetter = 'V'

    const newPost = await db.insert(posts).values({
      title,
      slug,
      content,
      channelId: channelId || null,
      author,
      authorColor,
      avatarBg,
      avatarLetter,
      published: true, // Auto-publish visitor messages
      views: 0
    }).returning()

    return NextResponse.json({ success: true, post: newPost[0] }, { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
