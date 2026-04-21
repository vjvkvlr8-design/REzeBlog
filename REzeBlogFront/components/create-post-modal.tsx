'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CreatePostModalProps {
  initialTitle: string
  initialContent?: string
  attachments?: {id: string, data: string}[]
  channelId: number | null
  onClose: () => void
}

export function CreatePostModal({ initialTitle, initialContent = '', attachments = [], channelId, onClose }: CreatePostModalProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [userLevel, setUserLevel] = useState<number>(4)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current user level. If 4 (Guest), they must enter nickname and password.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUserLevel(data.user.level)
          setNickname(data.user.nickname)
        } else {
          setUserLevel(4)
          setNickname(localStorage.getItem('guest_id') || '게스트#0001')
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userLevel === 4 && (!nickname || !password)) {
      alert('비회원은 게시글 수정/삭제를 위한 닉네임과 임시 비밀번호를 반드시 입력해야 합니다.')
      return
    }

    setIsLoading(true)

    // Append images at the bottom if they are in attachments but not manually placed in text
    let finalContent = content
    attachments.forEach(att => {
      if (!finalContent.includes(`[사진: ${att.id}]`)) {
        finalContent += `\n\n![업로드된 이미지](${att.data})`
      } else {
        finalContent = finalContent.replace(`[사진: ${att.id}]`, `![업로드된 이미지](${att.data})`)
      }
    })

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: initialTitle,
          slug: 'post-' + Math.random().toString(36).substring(2, 10),
          content: finalContent,
          channelId: channelId,
          authorNickname: nickname,
          authorPassword: password, // Only relevant/saved if level 4
          isAuth: userLevel !== 4 
        })
      })

      if (res.ok) {
        onClose()
        router.refresh()
      } else {
        const errorData = await res.json()
        alert(errorData.error || '게시글 작성을 실패했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '800px', maxWidth: '90%', background: 'var(--dc-bg-primary)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--dc-header-primary)', fontSize: '20px' }}>게시글 작성</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
        </div>

        <div style={{ fontSize: '14px', color: 'var(--dc-text-muted)' }}>
          <strong>제목:</strong> {initialTitle}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="마크다운으로 본문을 작성하세요...&#10;- **굵게**&#10;- *기울임*&#10;- `코드`"
            required
            style={{ width: '100%', minHeight: '300px', background: 'var(--dc-bg-secondary)', border: '1px solid var(--dc-bg-tertiary)', borderRadius: '4px', padding: '12px', color: 'var(--dc-text-normal)', fontSize: '14px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              {userLevel === 4 ? (
                <>
                  <input 
                    placeholder="임시 닉네임 [게스트]" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    style={{ background: 'var(--dc-bg-tertiary)', border: 'none', padding: '10px', borderRadius: '4px', color: '#fff', width: '200px' }}
                  />
                  <input 
                    type="password" 
                    placeholder="삭제용 비밀번호 (필수)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ background: 'var(--dc-bg-tertiary)', border: 'none', padding: '10px', borderRadius: '4px', color: '#fff', width: '200px' }}
                  />
                </>
              ) : (
                <div style={{ color: 'var(--dc-text-muted)', fontSize: '14px' }}>
                  <strong>{nickname}</strong>님으로 자동 인증되어 기록됩니다.
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={{ background: '#5865f2', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? '발행 중...' : '즉시 발행'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
