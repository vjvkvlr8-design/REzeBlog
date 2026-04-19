import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { reactions, posts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/reactions?postId=123 - Fetch reactions for a post
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

    const postReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.postId, parseInt(postId)))

    return NextResponse.json(postReactions)
  } catch (error) {
    console.error('Failed to fetch reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

// POST /api/reactions - Toggle a reaction (add or increment)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId, emoji } = body

    if (!postId || !emoji) {
      return NextResponse.json(
        { error: 'postId and emoji are required' },
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

    // Check if reaction already exists
    const existing = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.postId, parseInt(postId)),
          eq(reactions.emoji, emoji)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Increment existing reaction
      const updated = await db
        .update(reactions)
        .set({ count: existing[0].count + 1 })
        .where(eq(reactions.id, existing[0].id))
        .returning()

      return NextResponse.json(updated[0])
    } else {
      // Create new reaction
      const newReaction = await db
        .insert(reactions)
        .values({
          postId: parseInt(postId),
          emoji,
          count: 1,
        })
        .returning()

      return NextResponse.json(newReaction[0], { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create/update reaction:', error)
    return NextResponse.json(
      { error: 'Failed to create/update reaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/reactions - Decrement or remove a reaction
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const emoji = searchParams.get('emoji')

    if (!postId || !emoji) {
      return NextResponse.json(
        { error: 'postId and emoji are required' },
        { status: 400 }
      )
    }

    // Find existing reaction
    const existing = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.postId, parseInt(postId)),
          eq(reactions.emoji, emoji)
        )
      )
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Reaction not found' },
        { status: 404 }
      )
    }

    if (existing[0].count <= 1) {
      // Remove reaction if count would be 0
      await db
        .delete(reactions)
        .where(eq(reactions.id, existing[0].id))

      return NextResponse.json({ removed: true })
    } else {
      // Decrement reaction count
      const updated = await db
        .update(reactions)
        .set({ count: existing[0].count - 1 })
        .where(eq(reactions.id, existing[0].id))
        .returning()

      return NextResponse.json(updated[0])
    }
  } catch (error) {
    console.error('Failed to delete reaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete reaction' },
      { status: 500 }
    )
  }
}
