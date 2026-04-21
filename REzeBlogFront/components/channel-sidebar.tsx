// Channel Sidebar - Discord 채널 목록 (240px)
// 블로그 카테고리 = 디스코드 채널 카테고리
// 게시글 주제 = 디스코드 채널
// 작성일: 2026-04-19 (Antigravity)

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

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

export function ChannelSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentChannel = searchParams?.get('ch') || (pathname === '/' ? 'welcome' : '')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        // Transform API response to match component interface
        const transformed = data.map((cat: any) => ({
          name: cat.name,
          channels: cat.channels.map((ch: any) => ({
            slug: ch.slug,
            name: ch.name,
            // Use actual postCount fetched from API instead of 0
            badge: ch.postCount || 0,
          })),
        }))
        setCategories(transformed)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleCategory = (name: string) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }))
  }

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`channel-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Server name header */}
      <div className="channel-header">
        <span style={{ flex: 1 }}>REzeBlog</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>▼</span>
      </div>

      {/* Channel list */}
      <div className="channel-list">
        {loading ? (
          <div style={{ padding: 20, color: 'var(--dc-text-muted)', fontSize: 13, textAlign: 'center' }}>
            채널 로딩 중...
          </div>
        ) : (
          categories.map((cat) => (
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
        )))}
      </div>
    </div>
    </>
  )
}
