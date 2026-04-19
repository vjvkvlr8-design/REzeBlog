// Admin Login Page - 절대 외부 노출 불가
// 직접 URL 입력으로만 접근 가능 (어디에도 링크 없음)
// 작성일: 2026-04-19 (Antigravity)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        setError('비밀번호가 올바르지 않습니다')
      }
    } catch {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--dc-bg-tertiary)',
    }}>
      <div style={{
        background: 'var(--dc-bg-primary)', borderRadius: 8, padding: 32,
        width: 400, maxWidth: '90vw',
        boxShadow: 'var(--dc-elevation-high)',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--dc-header-primary)', textAlign: 'center', marginBottom: 8 }}>
          🔒
        </h1>
        <p style={{ fontSize: 14, color: 'var(--dc-text-muted)', textAlign: 'center', marginBottom: 24 }}>
          관리자 인증이 필요합니다
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--dc-header-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.02em' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', marginTop: 8,
                background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: 4,
                color: 'var(--dc-text-normal)', fontSize: 16, outline: 'none',
              }}
              autoFocus
              placeholder="어드민 비밀번호 입력"
            />
          </div>

          {error && (
            <p style={{ color: 'var(--dc-text-danger)', fontSize: 14, marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '12px', background: 'var(--dc-brand)',
              color: '#fff', border: 'none', borderRadius: 4, fontSize: 16,
              fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              opacity: loading || !password ? 0.5 : 1,
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? '인증 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
