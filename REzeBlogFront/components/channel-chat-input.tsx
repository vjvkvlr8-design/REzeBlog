'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef } from 'react'

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!inputRef.current) return
    
    const content = inputRef.current.value
    if (!content.trim()) return

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          slug: 'chat-' + Math.random().toString(36).substring(2, 9),
          content: content,
          channelId: currentChannel?.id || null,
          published: true
        })
      })

      if (res.ok) {
        inputRef.current.value = ''
        router.refresh()
      } else {
        alert('메시지 전송에 실패했습니다. (관리자 권한이 필요할 수 있습니다.)')
      }
    } catch (err) {
      console.error(err)
      alert('네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="chat-input-wrapper">
      <form className="chat-input" onSubmit={handleSubmit}>
        <span className="chat-input-icon">＋</span>
        <input 
          ref={inputRef}
          type="text" 
          className="chat-input-placeholder" 
          placeholder={`#${currentChannel?.name || '일반'} 에 메시지 보내기`}
          style={{ background: 'transparent', border: 'none', color: 'var(--dc-text-normal)', width: '100%', outline: 'none' }}
        />
        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="chat-input-icon">😀</span>
        </button>
      </form>
    </div>
  )
}
