// Server Sidebar - Discord 서버 아이콘 스트립 (좌측 72px)
// 작성일: 2026-04-19 (Antigravity)

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthWidget } from './auth-widget'
import { GameWidget } from './game-widget'

interface ServerIconData {
  id: number
  name: string
  iconUrl: string | null
  linkUrl: string
  orderIndex: number
  isDiscordIcon: boolean
}

const defaultServers = [
  { id: 'home', linkUrl: '/', iconUrl: null, name: 'REzeBlog 홈', isDiscordIcon: true },
]

export function ServerSidebar() {
  const pathname = usePathname()
  const [dbServers, setDbServers] = useState<ServerIconData[]>([])

  useEffect(() => {
    fetch('/api/admin/servers')
      .then(res => res.ok ? res.json() : [])
      .then(data => setDbServers(data))
      .catch(() => {})
  }, [])

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
      {dbServers.map((s) => (
        <Link
          key={s.id}
          href={s.linkUrl}
          className={`server-icon ${pathname === s.linkUrl ? 'active' : ''}`}
          title={s.name}
        >
          {s.iconUrl ? (
            <img src={s.iconUrl} alt={s.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--dc-interactive-normal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
              {s.name.charAt(0)}
            </div>
          )}
        </Link>
      ))}

      <div className="server-separator" />

      {/* Auth Widget (User Avatar & Login) */}
      <AuthWidget />
      
      <div className="server-separator" />
      
      {/* Game Widget embedded as a server icon */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}>
        <GameWidget />
      </div>
    </div>
  )
}
