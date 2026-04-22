// Server Sidebar - Discord 서버 아이콘 스트립 (좌측 72px)
// 작성일: 2026-04-19 (Antigravity)

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthWidget } from './auth-widget'
import { GameWidget } from './game-widget'
import { SidebarTooltip } from './sidebar-tooltip'

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
        <SidebarTooltip key={s.id} text={s.name}>
          <Link
            href={s.linkUrl}
            className={`server-icon ${pathname === s.linkUrl ? 'active' : ''}`}
            aria-label={s.name}
          >
            <div className="server-pill" />
            {s.iconUrl ? (
              <img src={s.iconUrl} alt={s.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 'inherit', background: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', fontSize: 20 }}>
                {s.name.charAt(0)}
              </div>
            )}
          </Link>
        </SidebarTooltip>
      ))}

      <div className="server-separator" />

      {/* Game Widget - 🎮 */}
      <SidebarTooltip text="미니게임 활성화">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 8 }}>
          <GameWidget />
        </div>
      </SidebarTooltip>

      {/* Spacer - pushes AuthWidget to the very bottom like Discord */}
      <div style={{ flexGrow: 1 }} />
      
      {/* Auth Widget (User Avatar & Login) - 맨 아래 고정 (Discord 스타일) */}
      <SidebarTooltip text="계정 관리">
        <AuthWidget />
      </SidebarTooltip>
    </div>
  )
}
