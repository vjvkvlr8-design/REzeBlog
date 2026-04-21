// 메인 페이지 = Discord #환영합니다 채널
// 대시보드가 아닌, 블로그 소개 + 최근 활동을 디스코드 채팅으로 표현
// 작성일: 2026-04-19 (Antigravity)

import { Metadata } from 'next'

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
            이곳은 REzeBlog의 시작점입니다. 왼쪽 채널 목록에서 관심 있는 주제를 선택하여 커뮤니티와 소통해보세요!
          </p>
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
