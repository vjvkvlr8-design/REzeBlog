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

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          background: 'var(--dc-bg-secondary)',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          padding: '24px',
          zIndex: 99999,
          color: 'var(--dc-text-normal)',
          animation: 'modalPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Close button */}
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--dc-text-muted)', cursor: 'pointer', fontSize: '18px' }}>
            &times;
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--dc-bg-tertiary)', paddingBottom: '20px' }}>
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
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button type="button" onClick={() => setIsLoginView(true)} style={{ flex: 1, background: isLoginView ? 'var(--dc-interactive-active)' : 'var(--dc-interactive-muted)', color: isLoginView ? '#000' : '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>로그인</button>
                <button type="button" onClick={() => setIsLoginView(false)} style={{ flex: 1, background: !isLoginView ? 'var(--dc-interactive-active)' : 'var(--dc-interactive-muted)', color: !isLoginView ? '#000' : '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>회원가입</button>
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalPop {
          0% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}} />
    </div>
  )
}
