// 게시글 상세 페이지 = Discord 스레드 형태
// 새 탭에서 열림 (target="_blank")
// 작성일: 2026-04-19 (Antigravity) - DB 연동 추가

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/drizzle'
import { posts, comments, reactions } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Fetch post from database
async function getPost(slug: string) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    })
    
    if (!post || !post.published) return null
    
    // Fetch comments and reactions
    const postComments = await db.select().from(comments).where(eq(comments.postId, post.id))
    const postReactions = await db.select().from(reactions).where(eq(reactions.postId, post.id))
    
    return {
      ...post,
      date: post.createdAt.toISOString().split('T')[0],
      time: post.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      fullContent: post.content.split('\n'),
      reactions: postReactions.map((r) => ({ emoji: r.emoji, count: r.count })),
      replies: postComments.map((c) => ({
        author: c.author,
        authorColor: c.authorColor,
        avatarBg: c.avatarBg,
        avatarLetter: c.avatarLetter,
        content: c.content,
        time: c.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      })),
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return null
  }
}

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: '게시글을 찾을 수 없습니다 | REzeBlog' }
  return {
    title: `${post.title} | REzeBlog`,
    description: post.excerpt || post.content.slice(0, 200),
    openGraph: { title: post.title, description: post.excerpt || post.content.slice(0, 200), type: 'article' },
  }
}

// Generate static params from all published posts
export async function generateStaticParams() {
  try {
    const allPosts = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.published, true))
    return allPosts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

function renderLine(line: string, idx: number) {
  if (line.startsWith('## ')) return <h2 key={idx} style={{ fontSize: 20, fontWeight: 700, color: 'var(--dc-header-primary)', margin: '16px 0 8px' }}>{line.slice(3)}</h2>
  if (line.startsWith('### ')) return <h3 key={idx} style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', margin: '12px 0 4px' }}>{line.slice(4)}</h3>
  if (line.startsWith('```')) return <div key={idx} style={{ background: 'var(--dc-bg-secondary)', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 14, margin: '4px 0', color: 'var(--dc-text-normal)' }}>{line.slice(3) || ' '}</div>
  if (line.startsWith('- ')) return <div key={idx} style={{ paddingLeft: 16, color: 'var(--dc-text-normal)', lineHeight: 1.6 }}>• {line.slice(2)}</div>
  if (line.match(/^\d+\. /)) return <div key={idx} style={{ paddingLeft: 16, color: 'var(--dc-text-normal)', lineHeight: 1.6 }}>{line}</div>
  if (line === '') return <div key={idx} style={{ height: 8 }} />
  // Bold handling
  const parts = line.split(/\*\*(.*?)\*\*/)
  return <p key={idx} style={{ color: 'var(--dc-text-normal)', lineHeight: 1.6 }}>
    {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--dc-header-primary)' }}>{part}</strong> : part)}
  </p>
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <>
      {/* Chat Header - 스레드 형태 */}
      <div className="chat-header">
        <span className="chat-header-hash" style={{ fontSize: 20 }}>🧵</span>
        <span className="chat-header-name">스레드</span>
        <div className="chat-header-divider" />
        <span className="chat-header-topic" style={{ flex: 1 }}>{post.title}</span>
        <Link href="/blog" style={{ color: 'var(--dc-interactive-normal)', fontSize: 14, textDecoration: 'none' }}>
          ← #일반 로 돌아가기
        </Link>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Original post */}
        <div className="message message-first">
          <div className={`message-avatar ${post.avatarBg}`}>{post.avatarLetter}</div>
          <div className="message-header">
            <span className="message-username" style={{ color: post.authorColor }}>{post.author}</span>
            <span className="message-timestamp">{post.date} {post.time}</span>
          </div>
          <div className="message-content">
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dc-header-primary)', marginBottom: 12 }}>
              {post.title}
            </div>
            {post.fullContent.map((line, i) => renderLine(line, i))}
          </div>
        </div>

        {/* Reactions */}
        <div className="message">
          <div className="message-reactions">
            {post.reactions.map((r, i) => (
              <button key={i} className={`message-reaction ${i === 0 ? 'reacted' : ''}`}>{r.emoji} {r.count}</button>
            ))}
          </div>
        </div>

        {/* Replies */}
        {post.replies.length > 0 && (
          <>
            <div className="date-separator">
              <div className="date-separator-line" />
              <span className="date-separator-text">댓글 {post.replies.length}개</span>
              <div className="date-separator-line" />
            </div>
            {post.replies.map((reply, i) => (
              <div key={i} className="message message-first">
                <div className={`message-avatar ${reply.avatarBg}`}>{reply.avatarLetter}</div>
                <div className="message-reply">
                  <div className="message-reply-avatar" style={{ background: post.authorColor }}>{post.avatarLetter}</div>
                  <span className="message-reply-name">{post.author}</span>
                  <span className="message-reply-text">{post.title}</span>
                </div>
                <div className="message-header">
                  <span className="message-username" style={{ color: reply.authorColor }}>{reply.author}</span>
                  <span className="message-timestamp">{reply.time}</span>
                </div>
                <div className="message-content">{reply.content}</div>
              </div>
            ))}
          </>
        )}

        {/* Comment input hint */}
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: 13 }}>
            💬 댓글 기능은 준비 중입니다
          </p>
        </div>
      </div>

      {/* Chat Input */}
      <div className="chat-input-wrapper">
        <div className="chat-input">
          <span className="chat-input-icon">＋</span>
          <span className="chat-input-placeholder">이 스레드에 답장하기...</span>
          <span className="chat-input-icon">😀</span>
        </div>
      </div>
    </>
  )
}
