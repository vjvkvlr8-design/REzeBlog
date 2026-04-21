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
  const [hoveredServer, setHoveredServer] = useState<number | null>(null)

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
        <div 
          key={s.id} 
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredServer(s.id)}
          onMouseLeave={() => setHoveredServer(null)}
        >
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
          
          {hoveredServer === s.id && (
            <div style={{
              position: 'absolute',
              left: '70px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--dc-bg-floating)',
              color: 'var(--dc-text-normal)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--dc-elevation-high)',
              zIndex: 100,
              pointerEvents: 'none'
            }}>
              {s.name}
              {/* Tooltip triangle */}
              <div style={{
                position: 'absolute',
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderRight: '4px solid var(--dc-bg-floating)'
              }} />
            </div>
          )}
        </div>
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
