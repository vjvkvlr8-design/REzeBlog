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

export function ServerSidebar() {
  const pathname = usePathname()
  const [dbServers, setDbServers] = useState<ServerIconData[]>([])

  useEffect(() => {
    fetch('/api/admin/servers', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDbServers(data))
      .catch(() => {})
  }, [])

  return (
    <div className="server-sidebar">
      {/* Category servers from DB */}
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

      {/* Game Widget - 🎮 위에 배치 */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 8 }}>
        <GameWidget />
      </div>
      
      {/* Auth Widget (User Avatar & Login) - 🎮 아래 배치 */}
      <AuthWidget />
    </div>
  )
}
