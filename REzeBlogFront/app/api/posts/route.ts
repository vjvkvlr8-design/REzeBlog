import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { posts, comments, channels } from '@/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/posts - Fetch all published posts with comment counts
export async function GET() {
  try {
    // Fetch all published posts
    const allPosts = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        author: posts.author,
        authorColor: posts.authorColor,
        avatarBg: posts.avatarBg,
        avatarLetter: posts.avatarLetter,
        views: posts.views,
        createdAt: posts.createdAt,
        channelName: channels.name,
      })
      .from(posts)
      .leftJoin(channels, eq(posts.channelId, channels.id))
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

// DELETE /api/posts - Delete a single post by ID (Auth or Password verified)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const password = url.searchParams.get('password') // passed if Level 4 (guest)

    if (!id) return NextResponse.json({ error: 'Post ID required' }, { status: 400 })

    // Check token
    const cookieStore = require('next/headers').cookies()
    const token = cookieStore.get('auth_token')?.value
    const user = token ? await verifyToken(token) : null

    // Find the post
    const postRecord = await db.select().from(posts).where(eq(posts.id, parseInt(id))).limit(1)
    if (postRecord.length === 0) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const postToDel = postRecord[0]

    // Level 0: Admin (skip checks)
    if (user?.level === 0) {
      // Allowed
    } 
    // Level 3: Member (check author name matches user nickname)
    else if (user?.level === 3) {
      if (postToDel.author !== user.nickname) {
        return NextResponse.json({ error: '본인의 게시글만 삭제할 수 있습니다.' }, { status: 403 })
      }
    } 
    // Level 4: Guest (check password)
    else {
      if (!password) {
        return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 403 })
      }
      if (!postToDel.authorPassword) {
        return NextResponse.json({ error: '비밀번호가 설정되지 않은 이전 게시글입니다. 관리자에게 문의하세요.' }, { status: 403 })
      }
      
      const crypto = await import('crypto')
      const hashedAttempt = crypto.createHash('sha256').update(password).digest('hex')
      
      if (hashedAttempt !== postToDel.authorPassword) {
        return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
      }
    }

    // Delete post (comments will cascade if set up, or orphaned depending on DB. Assuming cascade)
    await db.delete(posts).where(eq(posts.id, parseInt(id)))
    await db.delete(comments).where(eq(comments.postId, parseInt(id))) // cleanup
    
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 })
  }
}
