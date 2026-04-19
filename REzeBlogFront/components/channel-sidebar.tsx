// Channel Sidebar - Discord 채널 목록 (240px)
// 블로그 카테고리 = 디스코드 채널 카테고리
// 게시글 주제 = 디스코드 채널
// 작성일: 2026-04-19 (Antigravity)

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Channel {
  slug: string
  name: string
  unread?: boolean
  badge?: number
}

interface Category {
  name: string
  channels: Channel[]
}

const categories: Category[] = [
  {
    name: '환영',
    channels: [
      { slug: 'welcome', name: '환영합니다' },
      { slug: 'about', name: '블로그-소개' },
      { slug: 'announcements', name: '공지사항', badge: 1 },
    ],
  },
  {
    name: '개발',
    channels: [
      { slug: 'nextjs-tips', name: 'nextjs-개발팁', unread: true },
      { slug: 'fullstack-guide', name: '풀스택-가이드' },
      { slug: 'indie-game-dev', name: '인디게임-개발' },
    ],
  },
  {
    name: '인터랙티브 스토리',
    channels: [
      { slug: 'interactive-storytelling', name: '스토리텔링-가이드' },
      { slug: 'text-game-dev', name: '텍스트게임-개발' },
      { slug: 'story-design', name: '서사-설계' },
    ],
  },
  {
    name: '자유게시판',
    channels: [
      { slug: 'general', name: '일반' },
      { slug: 'showcase', name: '작품-공유' },
    ],
  },
]

export function ChannelSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentChannel = searchParams?.get('ch') || (pathname === '/' ? 'welcome' : '')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCategory = (name: string) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="channel-sidebar">
      {/* Server name header */}
      <div className="channel-header">
        <span style={{ flex: 1 }}>REzeBlog</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>▼</span>
      </div>

      {/* Channel list */}
      <div className="channel-list">
        {categories.map((cat) => (
          <div key={cat.name} className="channel-category">
            <div
              className="channel-category-name"
              onClick={() => toggleCategory(cat.name)}
            >
              <span style={{ 
                fontSize: 10, 
                transform: collapsed[cat.name] ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.1s',
                display: 'inline-block',
              }}>▼</span>
              {cat.name}
            </div>

            {!collapsed[cat.name] && cat.channels.map((ch) => (
              <Link
                key={ch.slug}
                href={`/blog?ch=${ch.slug}`}
                className={`channel-item ${currentChannel === ch.slug ? 'active' : ''}`}
                style={{
                  fontWeight: ch.unread ? 600 : undefined,
                  color: ch.unread ? 'var(--dc-interactive-active)' : undefined,
                }}
              >
                <span className="channel-hash">#</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.name}
                </span>
                {ch.badge && <span className="badge">{ch.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* User area */}
      <div className="user-area">
        <div className="user-avatar">G</div>
        <div className="user-info">
          <div className="user-name">게스트</div>
          <div className="user-status">● 온라인</div>
        </div>
      </div>
    </div>
  )
}
