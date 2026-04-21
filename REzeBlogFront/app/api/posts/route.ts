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

// POST /api/posts - Create a new post (Public access for visitors & auth users)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, content, channelId, authorNickname, authorPassword, isAuth } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isAuth && (!authorNickname || !authorPassword)) {
      return NextResponse.json({ error: '비회원은 게시글 작성 시 닉네임과 비밀번호를 반드시 입력해야 합니다.' }, { status: 400 })
    }

    // Get IP
    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

    // Determine Author Identity & Style
    const author = isAuth ? (authorNickname || '회원') : authorNickname
    const authorColor = isAuth && authorNickname === '관리자' ? '#ffb347' : isAuth ? '#5865f2' : '#1abc9c'
    const avatarBg = isAuth && authorNickname === '관리자' ? 'orange' : isAuth ? 'blurple' : 'teal'
    const avatarLetter = author.charAt(0).toUpperCase()

    // Encrypt password if guest
    const crypto = await import('crypto')
    const finalPassword = !isAuth && authorPassword 
      ? crypto.createHash('sha256').update(authorPassword).digest('hex') 
      : null

    const newPost = await db.insert(posts).values({
      title,
      slug,
      content,
      channelId: channelId || null,
      author,
      authorColor,
      avatarBg,
      avatarLetter,
      authorIp: ip.toString().split(',')[0].trim(),
      authorPassword: finalPassword,
      published: true, // Auto-publish messages
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
