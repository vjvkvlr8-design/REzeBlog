// Server Sidebar - Discord 서버 아이콘 스트립 (좌측 72px)
// 작성일: 2026-04-19 (Antigravity)

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthWidget } from './auth-widget'

const servers = [
  { id: 'home', href: '/', icon: '🏠', label: 'REzeBlog 홈' },
]

// 블로그 카테고리를 서버 아이콘으로 표현
const categoryServers = [
  { id: 'dev', href: '/blog?cat=개발', icon: '💻', label: '개발' },
  { id: 'story', href: '/blog?cat=스토리', icon: '📖', label: '스토리' },
  { id: 'tutorial', href: '/blog?cat=튜토리얼', icon: '📚', label: '튜토리얼' },
]

export function ServerSidebar() {
  const pathname = usePathname()

  return (
    <div className="server-sidebar">
      {/* Home */}
      <Link
        href="/"
        className={`server-icon home-icon ${pathname === '/' ? 'active' : ''}`}
        title="REzeBlog 홈"
      >
        <span className="server-pill" style={{ height: pathname === '/' ? 40 : 0 }} />
        🏠
      </Link>

      <div className="server-separator" />

      {/* Category servers */}
      {categoryServers.map((s) => (
        <Link
          key={s.id}
          href={s.href}
          className={`server-icon ${pathname?.startsWith('/blog') ? '' : ''}`}
          title={s.label}
        >
          {s.icon}
        </Link>
      ))}

      <div className="server-separator" />

      {/* Auth Widget (User Avatar & Login) */}
      <AuthWidget />
    </div>
  )
}
