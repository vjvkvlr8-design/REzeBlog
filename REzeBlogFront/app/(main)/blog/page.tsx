// 블로그 페이지 = Discord 채널 채팅
// 게시글은 디스코드 채팅 메시지, 댓글은 디스코드 답장
// 작성일: 2026-04-19 (Antigravity) - DB 연동 추가

import { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/drizzle'
import { posts, comments, reactions, channels } from '@/db/schema'
import { asc, eq, and, inArray } from 'drizzle-orm'
import { ChannelChatInput } from '@/components/channel-chat-input'

export const metadata: Metadata = {
  title: '블로그 - 인터랙티브 스토리텔링과 개발 이야기 | REzeBlog',
  description: '텍스트 기반 인터랙티브 스토리, Next.js 14 개발 팁, 1인 개발자를 위한 실전 가이드.',
}

// Force dynamic rendering to handle query parameters
export const dynamic = 'force-dynamic'

// Fetch channel info by slug
async function getChannelInfo(slug: string) {
  try {
    const channel = await db.select().from(channels).where(eq(channels.slug, slug)).limit(1)
    return channel[0] || null
  } catch {
    return null
  }
}

// Fallback sample posts when DB is unavailable
const FALLBACK_POSTS = [
  {
    id: '1',
    slug: 'welcome-post',
    title: 'REzeBlog에 오신 것을 환영합니다!',
    content: 'Discord 스타일의 인터랙티브 블로그 시스템입니다.\n\n검색엔진 최적화(SEO)와 함께 몰입형 텍스트 게임 경험을 제공합니다.\n\n왼쪽 사이드바에서 채널을 선택해 다양한 콘텐츠를 탐색해보세요.',
    author: 'REzeBot',
    authorColor: '#5865f2',
    avatarBg: 'purple',
    avatarLetter: 'R',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    reactions: [{ emoji: '👋', count: 5 }, { emoji: '🎉', count: 3 }],
    replies: [
      {
        author: '방문자',
        authorColor: '#1abc9c',
        avatarBg: 'teal',
        avatarLetter: 'V',
        content: '멋진 디자인이네요! Discord 느낌이 정말 좋습니다.',
        time: '12:05'
      }
    ]
  },
  {
    id: '2',
    slug: 'nextjs-tips-1',
    title: 'Next.js 14 App Router 핵심 팁 5가지',
    content: '서버 컴포넌트와 클라이언트 컴포넌트를 효율적으로 사용하는 방법\n\n1. 데이터 페칭은 서버에서\n2. 인터랙션은 클라이언트에서\n3. 서버 액션으로 폼 처리\n4. Parallel Routes 활용\n5. Intercepting Routes로 모달 처리',
    author: 'DevHunter',
    authorColor: '#ed4245',
    avatarBg: 'red',
    avatarLetter: 'D',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    reactions: [{ emoji: '🔥', count: 12 }, { emoji: '📖', count: 8 }],
    replies: []
  },
  {
    id: '3',
    slug: 'interactive-story-intro',
    title: '텍스트 기반 인터랙티브 스토리란?',
    content: 'Santa Inc.에서 영감을 받은 분기형 스토리텔링 시스템\n\n당신의 선택에 따라 이야기가 전개됩니다.\n\n플레이어의 결정이 게임 세계에 영향을 미치는 동적인 경험을 제공합니다.',
    author: 'StoryMaker',
    authorColor: '#f39c12',
    avatarBg: 'orange',
    avatarLetter: 'S',
    date: new Date().toISOString().split('T')[0],
    time: '16:45',
    reactions: [{ emoji: '🎮', count: 7 }],
    replies: [
      {
        author: '게이머',
        authorColor: '#2ecc71',
        avatarBg: 'green',
        avatarLetter: 'G',
        content: 'Santa Inc. 재밌게 했는데 기대됩니다!',
        time: '17:00'
      },
      {
        author: '독자',
        authorColor: '#9b59b6',
        avatarBg: 'purple',
        avatarLetter: '독',
        content: '한국어 인터랙티브 스토리는 처음 보네요.',
        time: '17:15'
      }
    ]
  }
]

// Fetch posts from database with optional channel/category filter
async function getPosts(channelSlug?: string, categoryName?: string) {
  try {
    let allPosts
    
    if (channelSlug) {
      // Filter by channel slug
      const channel = await db.select().from(channels).where(eq(channels.slug, channelSlug)).limit(1)
      if (channel.length > 0) {
        allPosts = await db
          .select()
          .from(posts)
          .where(and(eq(posts.published, true), eq(posts.channelId, channel[0].id)))
          .orderBy(asc(posts.createdAt))
      } else {
        allPosts = await db.select().from(posts).where(eq(posts.published, true)).orderBy(asc(posts.createdAt))
      }
    } else if (categoryName) {
      // Filter by category name - find channels in this category
      const { categories } = await import('@/db/schema')
      const category = await db.select().from(categories).where(eq(categories.name, categoryName)).limit(1)
      
      if (category.length > 0) {
        const categoryChannels = await db.select().from(channels).where(eq(channels.categoryId, category[0].id))
        const channelIds = categoryChannels.map(ch => ch.id)
        
        if (channelIds.length > 0) {
          allPosts = await db
            .select()
            .from(posts)
            .where(and(
              eq(posts.published, true),
              inArray(posts.channelId, channelIds)
            ))
            .orderBy(asc(posts.createdAt))
        } else {
          allPosts = await db.select().from(posts).where(eq(posts.published, true)).orderBy(asc(posts.createdAt))
        }
      } else {
        allPosts = await db.select().from(posts).where(eq(posts.published, true)).orderBy(asc(posts.createdAt))
      }
    } else {
      // All posts
      allPosts = await db.select().from(posts).where(eq(posts.published, true)).orderBy(asc(posts.createdAt))
    }
    
    const allComments = await db.select().from(comments)
    const allReactions = await db.select().from(reactions)
    
    // Format posts with comments and reactions
    return allPosts.map((post) => ({
      id: String(post.id),
      slug: post.slug,
      title: post.title,
      content: post.content,
      author: post.author,
      authorColor: post.authorColor,
      avatarBg: post.avatarBg,
      avatarLetter: post.avatarLetter,
      date: post.createdAt.toISOString().split('T')[0],
      time: post.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      reactions: allReactions.filter((r) => r.postId === post.id).map((r) => ({ emoji: r.emoji, count: r.count })),
      replies: allComments
        .filter((c) => c.postId === post.id)
        .map((c) => ({
          author: c.author,
          authorColor: c.authorColor,
          avatarBg: c.avatarBg,
          avatarLetter: c.avatarLetter,
          content: c.content,
          time: c.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        })),
    }))
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    // Return fallback posts when DB is unavailable
    return FALLBACK_POSTS
  }
}
// Types for formatted posts
interface Reply {
  author: string
  authorColor: string
  avatarBg: string
  avatarLetter: string
  content: string
  time: string
}

interface Reaction {
  emoji: string
  count: number
}

interface FormattedPost {
  id: string
  slug: string
  title: string
  content: string
  author: string
  authorColor: string
  avatarBg: string
  avatarLetter: string
  date: string
  time: string
  reactions: Reaction[]
  replies: Reply[]
}

// Page props with searchParams
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BlogPage({ searchParams }: PageProps) {
  // Get channel from query param (?ch=channel-slug)
  const channelSlug = typeof searchParams.ch === 'string' ? searchParams.ch : undefined
  // Get category from query param (?cat=category-name) - used by ServerSidebar
  const categoryName = typeof searchParams.cat === 'string' ? searchParams.cat : undefined
  
  // Fetch channel info if channel slug is provided
  const currentChannel = channelSlug ? await getChannelInfo(channelSlug) : null
  
  const posts = await getPosts(channelSlug, categoryName)
  
  // 날짜별 그룹핑
  const dateGroups: Record<string, FormattedPost[]> = {}
  posts.forEach((p: FormattedPost) => {
    if (!dateGroups[p.date]) dateGroups[p.date] = []
    dateGroups[p.date].push(p)
  })

  return (
    <>
      {/* Chat Header */}
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">{currentChannel?.name || '모든 채널'}</span>
        <div className="chat-header-divider" />
        <span className="chat-header-topic">
          {currentChannel ? `${currentChannel.name} 채널의 게시글` : '모든 게시글을 한눈에 확인하세요'}
        </span>
      </div>

      {/* Chat Messages (Posts) */}
      <div className="chat-messages">
        {/* Welcome */}
        <div className="welcome-message">
          <div className="welcome-icon">#</div>
          <h1 className="welcome-title">#{currentChannel?.name || '모든 채널'}에 오신 것을 환영해요!</h1>
          <p className="welcome-desc">
            {currentChannel 
              ? `${currentChannel.name} 채널의 게시글을 확인하세요. 게시글을 클릭하면 상세 내용을 볼 수 있습니다.`
              : '모든 블로그 게시글이 채팅 형태로 표시됩니다. 왼쪽 사이드바에서 채널을 선택해보세요.'}
          </p>
        </div>

        {Object.entries(dateGroups).map(([date, datePosts]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="date-separator">
              <div className="date-separator-line" />
              <span className="date-separator-text">{date}</span>
              <div className="date-separator-line" />
            </div>

            {datePosts.map((post) => (
              <div key={post.id}>
                {/* Post as message */}
                <div className="message message-first">
                  <div className={`message-avatar ${post.avatarBg}`}>{post.avatarLetter}</div>
                  <div className="message-header">
                    <span className="message-username" style={{ color: post.authorColor }}>{post.author}</span>
                    <span className="message-timestamp">{post.time}</span>
                  </div>
                  <div className="message-content">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="message-post-title">
                      {post.title}
                    </Link>
                    <div className="message-post-excerpt">
                      {post.content.split('\n')[0]}
                    </div>
                  </div>
                </div>

                {/* Post embed (extra content) */}
                {post.content.split('\n').length > 2 && (
                  <div className="message">
                    <div className="message-embed" style={{ borderLeftColor: post.authorColor }}>
                      <div className="message-embed-desc" style={{ fontSize: 13 }}>
                        {post.content.split('\n').slice(2, 4).join(' ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reactions */}
                {post.reactions.length > 0 && (
                  <div className="message">
                    <div className="message-reactions">
                      {post.reactions.map((r, i) => (
                        <button key={i} className={`message-reaction ${i === 0 ? 'reacted' : ''}`}>
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replies (comments) */}
                {post.replies.map((reply, i) => (
                  <div key={i} className="message message-first" style={{ marginTop: 4 }}>
                    <div className={`message-avatar ${reply.avatarBg}`} style={{ width: 40, height: 40 }}>
                      {reply.avatarLetter}
                    </div>
                    <div className="message-reply">
                      <div className="message-reply-avatar" style={{ background: post.authorColor }}>
                        {post.avatarLetter}
                      </div>
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
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <ChannelChatInput currentChannel={currentChannel} />
    </>
  )
}
