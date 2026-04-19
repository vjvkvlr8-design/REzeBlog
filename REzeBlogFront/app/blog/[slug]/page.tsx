// 게시글 상세 페이지 = Discord 스레드 형태
// 새 탭에서 열림 (target="_blank")
// 작성일: 2026-04-19 (Antigravity)

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 게시글 데이터 (DB 연동 예정 - 현재 하드코딩)
const postsData: Record<string, {
  slug: string
  title: string
  content: string
  author: string
  authorColor: string
  avatarBg: string
  avatarLetter: string
  date: string
  time: string
  channel: string
  fullContent: string[]
  reactions: { emoji: string; count: number }[]
  replies: { author: string; authorColor: string; avatarBg: string; avatarLetter: string; content: string; time: string }[]
}> = {
  'interactive-storytelling-guide': {
    slug: 'interactive-storytelling-guide',
    title: '인터랙티브 스토리텔링 완벽 가이드: 독자가 주인공이 되는 이야기',
    content: '텍스트 기반 인터랙티브 스토리텔링의 모든 것.',
    author: '스토리텔러', authorColor: '#9b59b6', avatarBg: 'purple', avatarLetter: 'S',
    date: '2026-04-19', time: '오후 3:24', channel: '일반',
    fullContent: [
      '텍스트 기반 인터랙티브 스토리텔링의 모든 것. 독자의 선택으로 변하는 이야기를 만드는 방법과 Next.js로 구현하는 기술적 팁을 소개합니다.',
      '',
      '## 인터랙티브 스토리란?',
      '스토리텔링의 핵심은 **선택**입니다. 독자가 주인공이 되어 직접 이야기의 방향을 결정하는 경험은 기존 블로그와는 차원이 다른 몰입감을 제공합니다.',
      '',
      '### 왜 인터랙티브 스토리인가?',
      '- 독자 참여도가 일반 블로그 대비 **3~5배** 높음',
      '- 평균 체류 시간 **4분 이상** (일반 블로그 1.5분)',
      '- SNS 공유율 **2배** 이상',
      '',
      '### 시작하는 방법',
      '1. **Twine** - 프로그래밍 없이 시작 가능한 인터랙티브 픽션 에디터',
      '2. **Ink (Inkle)** - 게임 업계 표준 스크립팅 언어',
      '3. **Next.js + React** - 풀 커스텀 웹 기반 인터랙티브 스토리',
      '',
      '### 기술 스택 추천',
      '```',
      'Frontend: Next.js 14 (App Router)',
      'State: Zustand (게임 상태 관리)',
      'DB: PostgreSQL + Prisma',
      'Deploy: Vercel',
      '```',
      '',
      '독자의 선택이 이야기를 만듭니다. 당신의 블로그도 이야기가 될 수 있습니다.',
    ],
    reactions: [{ emoji: '📖', count: 12 }, { emoji: '🔥', count: 5 }, { emoji: '👍', count: 8 }],
    replies: [
      { author: '방문자', authorColor: '#1abc9c', avatarBg: 'teal', avatarLetter: 'V', content: '정말 유용한 가이드네요! Twine으로 시작하는 팁이 특히 좋았습니다 👏', time: '오후 4:01' },
      { author: '개발자', authorColor: '#3ba55d', avatarBg: 'green', avatarLetter: 'D', content: 'Next.js App Router랑 같이 쓰면 SSR SEO도 잡을 수 있어서 좋네요', time: '오후 5:15' },
    ],
  },
  'nextjs-fullstack-blog': {
    slug: 'nextjs-fullstack-blog',
    title: 'Next.js 14로 1인 개발 블로그 만들기: 풀스택 가이드',
    content: '1인 개발자를 위한 Next.js 14 풀스택 블로그 만들기.',
    author: '개발자', authorColor: '#3ba55d', avatarBg: 'green', avatarLetter: 'D',
    date: '2026-04-19', time: '오후 1:47', channel: '일반',
    fullContent: [
      '1인 개발자를 위한 Next.js 14 풀스택 블로그 만들기. App Router, Server Components, PostgreSQL 연동까지 실전 팁을 소개합니다.',
      '',
      '## App Router의 강점',
      'App Router의 강점은 서버 컴포넌트 기본 지원입니다. 데이터 fetching이 컴포넌트 레벨에서 자연스럽게 이루어지고, 클라이언트 번들이 줄어듭니다.',
      '',
      '### Server Components vs Client Components',
      '- **Server Components**: DB 직접 접근 가능, 번들 사이즈 0',
      '- **Client Components**: 인터랙션 필요 시 사용 (`"use client"`)',
      '',
      '### PostgreSQL + Prisma 설정',
      '```typescript',
      'import { PrismaClient } from "@prisma/client"',
      'const prisma = new PrismaClient()',
      '',
      'export async function getPosts() {',
      '  return prisma.post.findMany({',
      '    orderBy: { createdAt: "desc" }',
      '  })',
      '}',
      '```',
      '',
      '### SEO 최적화 팁',
      '1. `generateMetadata()` 사용 - 동적 메타데이터',
      '2. `generateStaticParams()` - ISR 최적화',
      '3. `sitemap.ts` + `robots.ts` - 크롤러 지원',
      '',
      'Next.js 14로 나만의 블로그를 만들어보세요!',
    ],
    reactions: [{ emoji: '💻', count: 15 }, { emoji: '🚀', count: 7 }],
    replies: [
      { author: '방문자2', authorColor: '#e91e63', avatarBg: 'red', avatarLetter: 'B', content: 'PostgreSQL 연동 부분이 궁금했는데 자세히 설명해주셔서 감사합니다!', time: '오후 2:30' },
    ],
  },
  'text-game-development': {
    slug: 'text-game-development',
    title: '텍스트 게임 개발 입문: 코드 없이 시작하는 방법',
    content: '프로그래밍 없이 텍스트 기반 게임을 만드는 방법.',
    author: '튜토리얼봇', authorColor: '#faa81a', avatarBg: 'orange', avatarLetter: 'T',
    date: '2026-04-19', time: '오전 11:30', channel: '일반',
    fullContent: [
      '프로그래밍 없이 텍스트 기반 게임을 만드는 방법. Twine, Ink, 그리고 Next.js로 진화하는 단계별 가이드.',
      '',
      '## Twine으로 시작하기',
      'Twine은 브라우저에서 바로 실행되는 인터랙티브 픽션 에디터입니다.',
      '',
      '### 단계별 가이드',
      '1. twinery.org 접속 → "Use in browser" 클릭',
      '2. 새 스토리 만들기 → 제목 입력',
      '3. 시작 패시지 작성 → [[선택지]] 문법으로 분기',
      '',
      '## Ink 스크립팅',
      '```ink',
      '=== start ===',
      '어둠 속에서 빛이 보인다.',
      '+ [빛을 향해 간다] -> light',
      '+ [그 자리에 머문다] -> stay',
      '```',
      '',
      '텍스트 게임은 가장 저비용으로 시작할 수 있는 게임 개발 분야입니다.',
    ],
    reactions: [{ emoji: '🎮', count: 9 }, { emoji: '📚', count: 4 }],
    replies: [],
  },
  'indie-game-development-guide': {
    slug: 'indie-game-development-guide',
    title: '인디 게임 개발 완벽 가이드: 1인 개발자의 성공 전략',
    content: '1인 인디 게임 개발자를 위한 실전 가이드.',
    author: '개발자', authorColor: '#3ba55d', avatarBg: 'green', avatarLetter: 'D',
    date: '2026-04-18', time: '오후 9:12', channel: '일반',
    fullContent: [
      '1인 인디 게임 개발자를 위한 실전 가이드. 기획부터 출시까지, 텍스트 게임부터 시작하는 저비용 고효율 개발 전략을 소개합니다.',
      '',
      '## 왜 텍스트 게임부터?',
      '- 그래픽 제작 비용 0원',
      '- 1인 개발 가능',
      '- 스토리에 집중 가능',
      '',
      '## 성공 전략',
      '1. 프로토타입을 빠르게 만든다',
      '2. 피드백을 받는다',
      '3. 반복 개선한다',
    ],
    reactions: [{ emoji: '💪', count: 6 }, { emoji: '🎯', count: 3 }],
    replies: [],
  },
  'story-based-games-guide': {
    slug: 'story-based-games-guide',
    title: '스토리 기반 게임 제작: 플레이어를 사로잡는 서사 설계',
    content: '스토리 기반 게임의 핵심 원칙.',
    author: '스토리텔러', authorColor: '#9b59b6', avatarBg: 'purple', avatarLetter: 'S',
    date: '2026-04-18', time: '오후 6:45', channel: '일반',
    fullContent: [
      '스토리 기반 게임의 핵심 원칙. 캐릭터, 플롯, 세계관을 설계하는 방법과 플레이어의 몰입을 극대화하는 기술적 팁을 소개합니다.',
      '',
      '## 3막 구조 적용',
      '게임에도 영화처럼 3막 구조를 적용할 수 있습니다:',
      '- **1막**: 세계관 소개 + 갈등 설정',
      '- **2막**: 선택과 결과 (분기)',
      '- **3막**: 클라이맥스 + 결말',
      '',
      '## 캐릭터 설계',
      '캐릭터는 독자의 감정 이입 대상입니다. 동기, 갈등, 성장이 명확해야 합니다.',
    ],
    reactions: [{ emoji: '✍️', count: 8 }],
    replies: [
      { author: '방문자', authorColor: '#1abc9c', avatarBg: 'teal', avatarLetter: 'V', content: '3막 구조를 게임에 적용하는 파트가 인상적이었습니다', time: '오후 7:20' },
    ],
  },
}

type Props = { params: { slug: string } }

export function generateMetadata({ params }: Props): Metadata {
  const post = postsData[params.slug]
  if (!post) return { title: '게시글을 찾을 수 없습니다 | REzeBlog' }
  return {
    title: `${post.title} | REzeBlog`,
    description: post.content,
    openGraph: { title: post.title, description: post.content, type: 'article' },
  }
}

export function generateStaticParams() {
  return Object.keys(postsData).map((slug) => ({ slug }))
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

export default function PostPage({ params }: Props) {
  const post = postsData[params.slug]
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
          ← #{post.channel} 로 돌아가기
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
