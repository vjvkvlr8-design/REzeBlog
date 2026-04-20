// 우측 스레드 패널 - Discord 스레드 보기 UI
// 현재 채널의 모든 게시글 목록을 목차 형태로 표시
// 작성일: 2026-04-19 (Antigravity)

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ThreadItem {
  slug: string
  title: string
  author: string
  authorColor: string
  avatarLetter: string
  avatarBg: string
  replyCount: number
  lastActivity: string
}

export function ThreadPanel() {
  const [isOpen, setIsOpen] = useState(true)
  const [threads, setThreads] = useState<ThreadItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setThreads(data)
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setThreads([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'absolute', right: 16, top: 56,
            background: 'var(--dc-bg-secondary)', border: '1px solid var(--dc-separator)',
            borderRadius: 4, padding: '6px 12px', color: 'var(--dc-interactive-normal)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          🧵 스레드 {threads.length}
        </button>
      )}

      {/* 모바일용 배경 어두워짐(백드롭) */}
      <div 
        onClick={() => setIsOpen(false)}
        className="thread-backdrop"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* 스레드 패널 본체 */}
      <div 
        className="thread-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 320, zIndex: 999,
          background: 'var(--dc-bg-secondary)',
          borderLeft: '1px solid rgba(79, 84, 92, 0.29)',
          boxShadow: 'var(--dc-elevation-high)',
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
      {/* Header */}
      <div style={{
        height: 48, padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--dc-elevation-low)',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--dc-header-primary)' }}>
          스레드
        </span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none', border: 'none', color: 'var(--dc-interactive-normal)',
            cursor: 'pointer', fontSize: 18, padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* Active threads header */}
        <div style={{
          padding: '8px 16px', fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '0.02em',
          color: 'var(--dc-channels-default)',
        }}>
          {loading ? '게시글 로딩 중...' : `전체 게시글 — ${threads.length}`}
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--dc-text-muted)' }}>
            로딩 중...
          </div>
        ) : threads.map((thread) => (
          <Link
            key={thread.slug}
            href={`/blog/${thread.slug}`}
            target="_blank"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{
              padding: '10px 16px', margin: '0 8px',
              borderRadius: 8, cursor: 'pointer',
              transition: 'background-color 0.1s ease',
            }}
            className="thread-item"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dc-bg-modifier-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Thread title */}
              <div style={{
                fontWeight: 600, fontSize: 14,
                color: 'var(--dc-header-primary)',
                marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {thread.title}
              </div>

              {/* Thread meta */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                color: 'var(--dc-text-muted)',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff',
                  background: thread.authorColor,
                }}>
                  {thread.avatarLetter}
                </div>
                <span style={{ color: thread.authorColor, fontWeight: 500 }}>{thread.author}</span>
                <span>·</span>
                <span>💬 {thread.replyCount}</span>
                <span>·</span>
                <span>{thread.lastActivity}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--dc-separator)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 12, color: 'var(--dc-text-muted)', textAlign: 'center',
        }}>
          게시글을 클릭하면 새 탭에서 열립니다
        </div>
      </div>
    </div>
    </>
  )
}
