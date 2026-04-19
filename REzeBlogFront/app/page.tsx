// 메인 페이지 = Discord #환영합니다 채널
// 대시보드가 아닌, 블로그 소개 + 최근 활동을 디스코드 채팅으로 표현
// 작성일: 2026-04-19 (Antigravity)

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'REzeBlog - 인터랙티브 스토리텔링 블로그',
  description: '텍스트 기반 인터랙티브 스토리와 SEO 최적화가 결합된 새로운 블로그 경험',
}

export default function Home() {
  return (
    <>
      {/* Chat Header */}
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">환영합니다</span>
        <div className="chat-header-divider" />
        <span className="chat-header-topic">REzeBlog에 오신 것을 환영합니다!</span>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {/* Welcome banner */}
        <div className="welcome-message">
          <div className="welcome-icon">👋</div>
          <h1 className="welcome-title">#환영합니다 에 오신 것을 환영해요!</h1>
          <p className="welcome-desc">
            이곳은 REzeBlog의 시작점입니다. 텍스트 기반 인터랙티브 스토리와 개발 블로그가 결합된 새로운 경험을 만나보세요.
          </p>
        </div>

        {/* Date separator */}
        <div className="date-separator">
          <div className="date-separator-line" />
          <span className="date-separator-text">2026년 4월 19일</span>
          <div className="date-separator-line" />
        </div>

        {/* Bot welcome message */}
        <div className="message message-first">
          <div className="message-avatar" style={{ background: '#5865f2' }}>R</div>
          <div className="message-header">
            <span className="message-username" style={{ color: '#5865f2' }}>REzeBlog Bot</span>
            <span style={{ fontSize: 12, color: '#5865f2', background: '#5865f233', padding: '1px 4px', borderRadius: 3, fontWeight: 500 }}>BOT</span>
            <span className="message-timestamp">오늘 오후 3:00</span>
          </div>
          <div className="message-content">
            REzeBlog에 오신 것을 환영합니다! 🎉
          </div>
        </div>
        <div className="message">
          <div className="message-content">
            이곳에서는 인터랙티브 스토리텔링, 개발 이야기, 그리고 텍스트 게임을 만나볼 수 있습니다.
          </div>
        </div>

        {/* Info embed */}
        <div className="message">
          <div className="message-embed" style={{ borderLeftColor: '#5865f2' }}>
            <div className="message-embed-title">📌 REzeBlog 가이드</div>
            <div className="message-embed-desc">
              <p>• 왼쪽 채널 목록에서 관심 있는 주제를 선택하세요</p>
              <p>• 게시글은 채팅 메시지 형태로 표시됩니다</p>
              <p>• 우측 하단 🎮 버튼으로 미니 텍스트 게임을 플레이할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* Reactions */}
        <div className="message">
          <div className="message-reactions">
            <button className="message-reaction reacted">👍 3</button>
            <button className="message-reaction">🎮 1</button>
            <button className="message-reaction">🔥 2</button>
          </div>
        </div>

        {/* Date separator */}
        <div className="date-separator">
          <div className="date-separator-line" />
          <span className="date-separator-text">최근 활동</span>
          <div className="date-separator-line" />
        </div>

        {/* Recent activity messages */}
        <div className="message message-first">
          <div className="message-avatar green">D</div>
          <div className="message-header">
            <span className="message-username" style={{ color: '#3ba55d' }}>개발자</span>
            <span className="message-timestamp">어제 오후 11:23</span>
          </div>
          <div className="message-content">
            <Link href="/blog?ch=nextjs-tips" className="message-post-title">
              Next.js 14로 1인 개발 블로그 만들기: 풀스택 가이드
            </Link>
            <div className="message-post-excerpt">
              1인 개발자를 위한 Next.js 14 풀스택 블로그 만들기. App Router, Server Components, PostgreSQL 연동까지 실전 팁을 소개합니다.
            </div>
          </div>
        </div>
        <div className="message">
          <div className="message-reactions">
            <button className="message-reaction">📖 5</button>
            <button className="message-reaction">💡 2</button>
          </div>
        </div>

        <div className="message message-first">
          <div className="message-avatar purple">S</div>
          <div className="message-header">
            <span className="message-username" style={{ color: '#9b59b6' }}>스토리텔러</span>
            <span className="message-timestamp">어제 오후 8:47</span>
          </div>
          <div className="message-content">
            <Link href="/blog?ch=interactive-storytelling" className="message-post-title">
              인터랙티브 스토리텔링 완벽 가이드: 독자가 주인공이 되는 이야기
            </Link>
            <div className="message-post-excerpt">
              텍스트 기반 인터랙티브 스토리텔링의 모든 것. 독자의 선택으로 변하는 이야기를 만드는 방법을 소개합니다.
            </div>
          </div>
        </div>

        {/* Reply example */}
        <div className="message message-first" style={{ marginTop: 8 }}>
          <div className="message-avatar teal">V</div>
          <div className="message-reply">
            <div className="message-reply-avatar" style={{ background: '#9b59b6' }}>S</div>
            <span className="message-reply-name">스토리텔러</span>
            <span className="message-reply-text">인터랙티브 스토리텔링 완벽 가이드...</span>
          </div>
          <div className="message-header">
            <span className="message-username" style={{ color: '#1abc9c' }}>방문자</span>
            <span className="message-timestamp">오늘 오전 9:15</span>
          </div>
          <div className="message-content">
            정말 유용한 가이드네요! Twine으로 시작하는 팁이 특히 좋았습니다 👏
          </div>
        </div>

        <div className="message message-first">
          <div className="message-avatar orange">T</div>
          <div className="message-header">
            <span className="message-username" style={{ color: '#faa81a' }}>튜토리얼봇</span>
            <span className="message-timestamp">오늘 오전 10:30</span>
          </div>
          <div className="message-content">
            <Link href="/blog?ch=text-game-dev" className="message-post-title">
              텍스트 게임 개발 입문: 코드 없이 시작하는 방법
            </Link>
            <div className="message-post-excerpt">
              프로그래밍 없이 텍스트 기반 게임을 만드는 방법. Twine, Ink, 그리고 Next.js로 진화하는 단계별 가이드.
            </div>
          </div>
        </div>
        <div className="message">
          <div className="message-embed" style={{ borderLeftColor: '#faa81a' }}>
            <div className="message-embed-title">📎 관련 링크</div>
            <div className="message-embed-desc">
              <p>Twine: twinery.org</p>
              <p>Ink: inklestudios.com/ink</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="chat-input-wrapper">
        <div className="chat-input">
          <span className="chat-input-icon">＋</span>
          <span className="chat-input-placeholder">#환영합니다 에 메시지 보내기</span>
          <span className="chat-input-icon">😀</span>
        </div>
      </div>
    </>
  )
}
