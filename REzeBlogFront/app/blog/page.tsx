// 블로그 페이지 = Discord 채널 채팅
// 게시글은 디스코드 채팅 메시지, 댓글은 디스코드 답장
// 작성일: 2026-04-19 (Antigravity)

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '블로그 - 인터랙티브 스토리텔링과 개발 이야기 | REzeBlog',
  description: '텍스트 기반 인터랙티브 스토리, Next.js 14 개발 팁, 1인 개발자를 위한 실전 가이드.',
}

// 게시글(채팅 메시지) 데이터 (DB 연동 예정)
const posts = [
  {
    id: '1',
    slug: 'interactive-storytelling-guide',
    title: '인터랙티브 스토리텔링 완벽 가이드: 독자가 주인공이 되는 이야기',
    content: '텍스트 기반 인터랙티브 스토리텔링의 모든 것. 독자의 선택으로 변하는 이야기를 만드는 방법과 Next.js로 구현하는 기술적 팁을 소개합니다.\n\n스토리텔링의 핵심은 **선택**입니다. 독자가 주인공이 되어 직접 이야기의 방향을 결정하는 경험은 기존 블로그와는 차원이 다른 몰입감을 제공합니다.',
    author: '스토리텔러',
    authorColor: '#9b59b6',
    avatarBg: 'purple',
    avatarLetter: 'S',
    date: '2026-04-19',
    time: '오후 3:24',
    reactions: [{ emoji: '📖', count: 12 }, { emoji: '🔥', count: 5 }, { emoji: '👍', count: 8 }],
    replies: [
      {
        author: '방문자',
        authorColor: '#1abc9c',
        avatarBg: 'teal',
        avatarLetter: 'V',
        content: '정말 유용한 가이드네요! Twine으로 시작하는 팁이 특히 좋았습니다 👏',
        time: '오후 4:01',
      },
      {
        author: '개발자',
        authorColor: '#3ba55d',
        avatarBg: 'green',
        avatarLetter: 'D',
        content: 'Next.js App Router랑 같이 쓰면 SSR SEO도 잡을 수 있어서 좋네요',
        time: '오후 5:15',
      },
    ],
  },
  {
    id: '2',
    slug: 'nextjs-fullstack-blog',
    title: 'Next.js 14로 1인 개발 블로그 만들기: 풀스택 가이드',
    content: '1인 개발자를 위한 Next.js 14 풀스택 블로그 만들기. App Router, Server Components, PostgreSQL 연동까지 실전 팁을 소개합니다.\n\nApp Router의 강점은 서버 컴포넌트 기본 지원입니다. 데이터 fetching이 컴포넌트 레벨에서 자연스럽게 이루어지고, 클라이언트 번들이 줄어듭니다.',
    author: '개발자',
    authorColor: '#3ba55d',
    avatarBg: 'green',
    avatarLetter: 'D',
    date: '2026-04-19',
    time: '오후 1:47',
    reactions: [{ emoji: '💻', count: 15 }, { emoji: '🚀', count: 7 }],
    replies: [
      {
        author: '방문자2',
        authorColor: '#e91e63',
        avatarBg: 'red',
        avatarLetter: 'B',
        content: 'PostgreSQL 연동 부분이 궁금했는데 자세히 설명해주셔서 감사합니다!',
        time: '오후 2:30',
      },
    ],
  },
  {
    id: '3',
    slug: 'text-game-development',
    title: '텍스트 게임 개발 입문: 코드 없이 시작하는 방법',
    content: '프로그래밍 없이 텍스트 기반 게임을 만드는 방법. Twine, Ink, 그리고 Next.js로 진화하는 단계별 가이드.\n\nTwine은 브라우저에서 바로 실행되는 인터랙티브 픽션 에디터입니다. 프로그래밍 지식 없이도 분기형 스토리를 만들 수 있어 입문자에게 최적입니다.',
    author: '튜토리얼봇',
    authorColor: '#faa81a',
    avatarBg: 'orange',
    avatarLetter: 'T',
    date: '2026-04-19',
    time: '오전 11:30',
    reactions: [{ emoji: '🎮', count: 9 }, { emoji: '📚', count: 4 }],
    replies: [],
  },
  {
    id: '4',
    slug: 'indie-game-development-guide',
    title: '인디 게임 개발 완벽 가이드: 1인 개발자의 성공 전략',
    content: '1인 인디 게임 개발자를 위한 실전 가이드. 기획부터 출시까지, 텍스트 게임부터 시작하는 저비용 고효율 개발 전략을 소개합니다.',
    author: '개발자',
    authorColor: '#3ba55d',
    avatarBg: 'green',
    avatarLetter: 'D',
    date: '2026-04-18',
    time: '오후 9:12',
    reactions: [{ emoji: '💪', count: 6 }, { emoji: '🎯', count: 3 }],
    replies: [],
  },
  {
    id: '5',
    slug: 'story-based-games-guide',
    title: '스토리 기반 게임 제작: 플레이어를 사로잡는 서사 설계',
    content: '스토리 기반 게임의 핵심 원칙. 캐릭터, 플롯, 세계관을 설계하는 방법과 플레이어의 몰입을 극대화하는 기술적 팁을 소개합니다.',
    author: '스토리텔러',
    authorColor: '#9b59b6',
    avatarBg: 'purple',
    avatarLetter: 'S',
    date: '2026-04-18',
    time: '오후 6:45',
    reactions: [{ emoji: '✍️', count: 8 }],
    replies: [
      {
        author: '방문자',
        authorColor: '#1abc9c',
        avatarBg: 'teal',
        avatarLetter: 'V',
        content: '3막 구조를 게임에 적용하는 파트가 인상적이었습니다',
        time: '오후 7:20',
      },
    ],
  },
]

export default function BlogPage() {
  // 날짜별 그룹핑
  const dateGroups: Record<string, typeof posts> = {}
  posts.forEach(p => {
    if (!dateGroups[p.date]) dateGroups[p.date] = []
    dateGroups[p.date].push(p)
  })

  return (
    <>
      {/* Chat Header */}
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">일반</span>
        <div className="chat-header-divider" />
        <span className="chat-header-topic">모든 게시글을 한눈에 확인하세요</span>
      </div>

      {/* Chat Messages (Posts) */}
      <div className="chat-messages">
        {/* Welcome */}
        <div className="welcome-message">
          <div className="welcome-icon">#</div>
          <h1 className="welcome-title">#일반 채널에 오신 것을 환영해요!</h1>
          <p className="welcome-desc">
            모든 블로그 게시글이 채팅 형태로 표시됩니다. 게시글 제목을 클릭하면 상세 내용을 볼 수 있습니다.
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
                    <Link href={`/blog/${post.slug}`} className="message-post-title">
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
      <div className="chat-input-wrapper">
        <div className="chat-input">
          <span className="chat-input-icon">＋</span>
          <span className="chat-input-placeholder">#일반 에 메시지 보내기</span>
          <span className="chat-input-icon">😀</span>
        </div>
      </div>
    </>
  )
}
