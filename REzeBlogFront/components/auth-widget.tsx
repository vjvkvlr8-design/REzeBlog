'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthWidget() {
  const router = useRouter()
  const [user, setUser] = useState<{ nickname: string, level: number } | null>(null)
  const [guestId, setGuestId] = useState('게스트#0001')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true)
  
  const [nicknameInput, setNicknameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')

  useEffect(() => {
    // 1. Fetch user auth status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        } else {
          // Generate guest ID if not logged in
          let storedGuest = localStorage.getItem('guest_id')
          if (!storedGuest) {
            storedGuest = '게스트#' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            localStorage.setItem('guest_id', storedGuest)
          }
          setGuestId(storedGuest)
        }
      })
      .catch(console.error)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register'
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nicknameInput, password: passwordInput })
      })
      
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        setIsModalOpen(false)
        router.refresh() // Refresh to update layouts
      } else {
        alert(data.error || '오류가 발생했습니다.')
      }
    } catch (err) {
      alert('네트워크 통신 중 오류가 발생했습니다.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' })
    setUser(null)
    router.refresh()
  }

  const currentLabel = user ? user.nickname : guestId
  const currentLevel = user ? user.level : 4
  const avatarLetter = currentLabel.charAt(0).toUpperCase()
  const avatarColor = currentLevel === 0 ? '#ffb347' : currentLevel === 3 ? '#5865f2' : '#7289da'

  return (
    <div className="auth-widget-wrapper" style={{ marginTop: 'auto', marginBottom: '16px', position: 'relative' }}>
      <button 
        className="server-icon"
        onClick={() => setIsModalOpen(!isModalOpen)}
        title={`${currentLabel} (Level ${currentLevel})`}
        style={{ background: avatarColor, color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
      >
        {avatarLetter}
      </button>

      {/* Auth Status & Login Modal Combo */}
      {isModalOpen && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '80px',
          width: '300px',
          background: 'var(--dc-bg-secondary)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          padding: '16px',
          zIndex: 9999,
          color: 'var(--dc-text-normal)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--dc-bg-tertiary)', paddingBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
              {avatarLetter}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{currentLabel}</div>
              <div style={{ fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                ● 온라인 | Level {currentLevel} {currentLevel === 0 ? '(어드민)' : currentLevel === 3 ? '(회원)' : '(게스트)'}
              </div>
            </div>
          </div>

          {user ? (
            <button 
              onClick={handleLogout}
              style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              로그아웃
            </button>
          ) : (
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button type="button" onClick={() => setIsLoginView(true)} style={{ flex: 1, background: isLoginView ? 'var(--dc-interactive-active)' : 'var(--dc-interactive-muted)', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>로그인</button>
                <button type="button" onClick={() => setIsLoginView(false)} style={{ flex: 1, background: !isLoginView ? 'var(--dc-interactive-active)' : 'var(--dc-interactive-muted)', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>회원가입</button>
              </div>
              
              <input 
                placeholder="고정 닉네임 [ID]"
                value={nicknameInput}
                onChange={e => setNicknameInput(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff' }}
              />
              <input 
                type="password"
                placeholder="비밀번호"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff' }}
              />
              <button 
                type="submit"
                style={{ width: '100%', padding: '10px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '4px' }}>
                {isLoginView ? '로그인' : '회원가입 및 시작'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
