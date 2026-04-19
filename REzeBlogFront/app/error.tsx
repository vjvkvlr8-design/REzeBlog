'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application Error:', error)
  }, [error])

  return (
    <>
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">오류</span>
      </div>
      <div className="chat-messages" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 8 }}>
            오류가 발생했습니다
          </h1>
          <p style={{ color: 'var(--dc-header-secondary)', marginBottom: 24, fontSize: 14 }}>
            예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {error.digest && (
            <p style={{ color: 'var(--dc-text-muted)', marginBottom: 16, fontSize: 12 }}>
              오류 코드: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: 'var(--dc-brand)', color: '#fff', border: 'none',
                padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}
            >
              다시 시도
            </button>
            <Link
              href="/"
              style={{
                background: 'var(--dc-bg-accent)', color: 'var(--dc-text-normal)', border: 'none',
                padding: '8px 20px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500,
              }}
            >
              메인으로
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
