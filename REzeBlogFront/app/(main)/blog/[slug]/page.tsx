// 게시글 상세 페이지 = Discord 스레드 형태
// 새 탭에서 열림 (target="_blank")
// 작성일: 2026-04-19 (Antigravity) - DB 연동 추가
// 최적화: 2026-04-20 - MarkdownRenderer 컴포넌트 적용
// 댓글 기능: 2026-04-20 - Discord 스타일 답장 UI 추가

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/drizzle'
import { posts, comments, reactions, channels, categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { CommentSection } from '@/components/comment-section'
import { PostDeleteButton } from '@/components/post-delete-button'

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
    
    // Fetch channel and category names for SEO
    let channelName = ''
    let categoryName = ''
    let channelSlug = ''
    if (post.channelId) {
      const channel = await db.select().from(channels).where(eq(channels.id, post.channelId)).limit(1)
      if (channel[0]) {
        channelName = channel[0].name
        channelSlug = channel[0].slug
        if (channel[0].categoryId) {
          const category = await db.select().from(categories).where(eq(categories.id, channel[0].categoryId)).limit(1)
          if (category[0]) categoryName = category[0].name
        }
      }
    }
    
    return {
      ...post,
      id: post.id,
      date: post.createdAt.toISOString().split('T')[0],
      time: post.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }),
      content: post.content,
      channel: channelName,
      channelSlug,
      category: categoryName,
      reactions: postReactions.map((r) => ({ emoji: r.emoji, count: r.count })),
      replies: postComments.map((c) => ({
        id: c.id,
        author: c.author,
        authorColor: c.authorColor,
        avatarBg: c.avatarBg,
        avatarLetter: c.avatarLetter,
        content: c.content,
        time: c.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }),
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
  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다 | REzeBlog',
      description: '요청하신 게시글을 찾을 수 없습니다.',
      openGraph: {
        title: '게시글을 찾을 수 없습니다',
        description: '요청하신 게시글을 찾을 수 없습니다.',
        type: 'website',
      },
      robots: { index: false, follow: false },
    }
  }

  const title = post.title
  const description = post.excerpt || post.content.slice(0, 200).replace(/\n/g, ' ')
  const url = `https://rezeblog.vercel.app/blog/${params.slug}`
  
  // Extract image from markdown content
  const imageMatch = post.content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/)
  const ogImage = imageMatch ? imageMatch[1] : 'https://rezeblog.vercel.app/og-default.png'

  return {
    title: `${title} | REzeBlog`,
    description,
    keywords: [post.category, post.channel, '블로그', 'REzeBlog', 'Discord 스타일'].filter(Boolean),
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'REzeBlog',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      section: post.category,
      tags: [post.category, post.channel].filter(Boolean),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@rezeblog',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
        <Link href={`/blog?ch=${post.channelSlug || 'welcome'}`} style={{ color: 'var(--dc-interactive-normal)', fontSize: 14, textDecoration: 'none' }}>
          ← #{post.channel || '일반'} 로 돌아가기
        </Link>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Original post */}
        <div className="message message-first">
          <div className={`message-avatar ${post.avatarBg}`}>{post.avatarLetter}</div>
          <div className="message-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="message-username" style={{ color: post.authorColor }}>{post.author}</span>
            <span className="message-timestamp">{post.date} {post.time}</span>
            <PostDeleteButton postId={post.id} postAuthor={post.author} />
          </div>
          <div className="message-content">
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dc-header-primary)', marginBottom: 12 }}>
              {post.title}
            </div>
            <MarkdownRenderer content={post.content} />
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

        {/* Comments - Discord Style Reply UI */}
        <CommentSection
          postId={post.id}
          postAuthor={post.author}
          postAuthorColor={post.authorColor}
          postAvatarLetter={post.avatarLetter}
          initialComments={post.replies.map((reply) => ({
            id: reply.id,
            postId: post.id,
            author: reply.author,
            authorColor: reply.authorColor,
            avatarBg: reply.avatarBg,
            avatarLetter: reply.avatarLetter,
            content: reply.content,
            createdAt: new Date().toISOString(),
          }))}
        />
      </div>

      {/* Footer spacing */}
      <div style={{ height: 24 }} />
    </>
  )
}
