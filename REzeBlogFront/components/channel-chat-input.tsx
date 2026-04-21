'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState, useEffect } from 'react'

interface ChannelChatInputProps {
  currentChannel: {
    id: number
    name: string
    slug: string
  } | null
}

export function ChannelChatInput({ currentChannel }: ChannelChatInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // States for text length and UI menus
  const [textLength, setTextLength] = useState(0)
  const [showPlusMenu, setShowPlusMenu] = useState(false)

  // Submits the post directly via public api
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!inputRef.current) return
    
    const content = inputRef.current.value
    if (!content.trim()) return

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          slug: 'chat-' + Math.random().toString(36).substring(2, 9),
          content: content,
          channelId: currentChannel?.id || null
        })
      })

      if (res.ok) {
        inputRef.current.value = ''
        setTextLength(0)
        router.refresh()
      } else {
        alert('메시지 전송에 실패했습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('네트워크 오류가 발생했습니다.')
    }
  }

  // Close plus menu if clicking outside (simplified logic attached to window)
  useEffect(() => {
    const handleClick = () => setShowPlusMenu(false)
    if (showPlusMenu) {
      // Small timeout to prevent immediate closing when button is clicked
      setTimeout(() => window.addEventListener('click', handleClick), 0)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [showPlusMenu])

  return (
    <div className="chat-input-wrapper" style={{ position: 'relative' }}>
      {/* Pop up menu for + button */}
      {showPlusMenu && (
        <div style={{ position: 'absolute', bottom: '100%', left: '16px', background: 'var(--dc-bg-secondary)', padding: '8px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', zIndex: 50, border: '1px solid var(--dc-bg-tertiary)' }}>
          <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => alert('사진 업로드 기능은 준비 중입니다.')}>
            <span style={{ fontSize: 18 }}>🖼️</span>
            <span style={{ color: 'var(--dc-text-normal)' }}>사진 카카오톡처럼 업로드</span>
          </div>
          <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => {
            if (inputRef.current) {
              inputRef.current.value += '[텍스트](http://링크)'
              setTextLength(inputRef.current.value.length)
            }
          }}>
            <span style={{ fontSize: 18 }}>🔗</span>
            <span style={{ color: 'var(--dc-text-normal)' }}>하이퍼링크 삽입</span>
          </div>
        </div>
      )}

      <form className="chat-input" onSubmit={handleSubmit}>
        <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <span className="chat-input-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--dc-interactive-normal)', color: 'var(--dc-bg-primary)', borderRadius: '50%', fontSize: 16, fontWeight: 'bold' }}>＋</span>
        </button>
        
        <input 
          ref={inputRef}
          type="text" 
          className="chat-input-placeholder" 
          placeholder={`#${currentChannel?.name || '일반'} 에 메시지 보내기`}
          onChange={(e) => setTextLength(e.target.value.trim().length)}
          style={{ background: 'transparent', border: 'none', color: 'var(--dc-text-normal)', width: '100%', outline: 'none', paddingLeft: '8px' }}
        />

        <button type="submit" disabled={textLength === 0} style={{ background: 'none', border: 'none', cursor: textLength === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={textLength > 0 ? '#ffffff' : 'var(--dc-text-muted)'} style={{ transition: 'fill 0.2s ease' }}>
            <path d="M2.01 21l20.99-9-20.99-9-.01 7 15 2-15 2z"/>
          </svg>
        </button>
      </form>

      {/* Global style to handle hover state without adding classes globally */}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-modifier:hover { background-color: var(--dc-bg-modifier-hover); }
      `}} />
    </div>
  )
}
