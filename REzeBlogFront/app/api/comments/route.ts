import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { comments, posts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/comments?postId=123 - Fetch comments for a post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const postComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, parseInt(postId)))
      .orderBy(desc(comments.createdAt))

    return NextResponse.json(postComments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId, content, authorNickname, authorPassword, isAuth } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postId and content are required' },
        { status: 400 }
      )
    }

    if (!isAuth && (!authorNickname || !authorPassword)) {
      return NextResponse.json(
        { error: '비회원은 댓글 작성 시 닉네임과 비밀번호를 반드시 입력해야 합니다.' },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .limit(1)

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
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

    // Create comment
    const newComment = await db
      .insert(comments)
      .values({
        postId: parseInt(postId),
        content,
        author,
        authorColor,
        avatarBg,
        avatarLetter,
        authorIp: ip.toString().split(',')[0].trim(),
        authorPassword: finalPassword,
      })
      .returning()

    return NextResponse.json(newComment[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments - Delete a single comment by ID (Auth or Password verified)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const password = url.searchParams.get('password') // passed if Level 4 (guest)

    if (!id) return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })

    // Check token
    const cookieStore = require('next/headers').cookies()
    const token = cookieStore.get('auth_token')?.value
    const user = token ? await verifyToken(token) : null

    // Find the comment
    const commentRecord = await db.select().from(comments).where(eq(comments.id, parseInt(id))).limit(1)
    if (commentRecord.length === 0) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const commentToDel = commentRecord[0]

    // Level 0: Admin (skip checks)
    if (user?.level === 0) {
      // Allowed
    } 
    // Level 3: Member (check author name matches user nickname)
    else if (user?.level === 3) {
      if (commentToDel.author !== user.nickname) {
        return NextResponse.json({ error: '본인의 댓글만 삭제할 수 있습니다.' }, { status: 403 })
      }
    } 
    // Level 4: Guest (check password)
    else {
      if (!password) {
        return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 403 })
      }
      if (!commentToDel.authorPassword) {
        return NextResponse.json({ error: '비밀번호가 설정되지 않은 이전 댓글입니다. 관리자에게 문의하세요.' }, { status: 403 })
      }
      
      const crypto = await import('crypto')
      const hashedAttempt = crypto.createHash('sha256').update(password).digest('hex')
      
      if (hashedAttempt !== commentToDel.authorPassword) {
        return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
      }
    }

    // Delete comment
    await db.delete(comments).where(eq(comments.id, parseInt(id)))
    
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 })
  }
}
