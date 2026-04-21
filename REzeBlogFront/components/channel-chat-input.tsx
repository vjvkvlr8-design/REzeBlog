'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState, useEffect } from 'react'
import { CreatePostModal } from './create-post-modal'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // States for text length and UI menus
  const [textLength, setTextLength] = useState(0)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')

  // Opens the modal instead of submitting directly to /api/posts
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!inputRef.current) return
    
    const content = inputRef.current.value
    if (!content.trim()) return

    setDraftTitle(content)
    setDraftContent('')
    setIsModalOpen(true)
  }

  // Handle post success cleanup
  const handleModalClose = () => {
    setIsModalOpen(false)
    if (inputRef.current) {
      inputRef.current.value = ''
      setTextLength(0)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const MAX_DIM = 800
        if (width > height && width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM }
        else if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        const base64 = canvas.toDataURL('image/jpeg', 0.6)
        const insertText = `![업로드된 이미지](${base64})`
        
        setDraftTitle(inputRef.current?.value || '사진 업로드')
        setDraftContent(insertText)
        setIsModalOpen(true)
        setShowPlusMenu(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="chat-input-wrapper" style={{ position: 'relative' }}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleImageUpload} 
      />
      {/* Pop up menu for + button */}
      {showPlusMenu && (
        <div style={{ position: 'absolute', bottom: '100%', left: '16px', background: 'var(--dc-bg-secondary)', padding: '8px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', zIndex: 50, border: '1px solid var(--dc-bg-tertiary)' }}>
          <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => {
            fileInputRef.current?.click()
          }}>
            <span style={{ fontSize: 18 }}>🖼️</span>
            <span style={{ color: 'var(--dc-text-normal)' }}>사진 업로드</span>
          </div>
          <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => {
            if (inputRef.current) {
              inputRef.current.value += '[텍스트](http://링크)'
              setTextLength(inputRef.current.value.length)
              // 메뉴 닫기
              setShowPlusMenu(false)
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

      {isModalOpen && (
        <CreatePostModal 
          initialTitle={draftTitle} 
          initialContent={draftContent}
          channelId={currentChannel?.id || null} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  )
}
