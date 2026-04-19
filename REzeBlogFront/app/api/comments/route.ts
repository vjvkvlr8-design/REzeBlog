import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { comments, posts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

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
    const { postId, content, author, authorColor, avatarBg, avatarLetter } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postId and content are required' },
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

    // Create comment
    const newComment = await db
      .insert(comments)
      .values({
        postId: parseInt(postId),
        content,
        author: author || '방문자',
        authorColor: authorColor || '#1abc9c',
        avatarBg: avatarBg || 'teal',
        avatarLetter: avatarLetter || 'V',
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
