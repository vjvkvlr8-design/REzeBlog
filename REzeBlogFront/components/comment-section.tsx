'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface Comment {
  id: number
  postId: number
  author: string
  authorColor: string
  avatarBg: string
  avatarLetter: string
  content: string
  createdAt: string
}

interface CommentSectionProps {
  postId: number
  postAuthor: string
  postAuthorColor: string
  postAvatarLetter: string
  initialComments: Comment[]
}

const AVATAR_COLORS = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'teal', 'orange']
const AVATAR_COLORS_HEX = ['#5865F2', '#57F287', '#ED4245', '#FEE75C', '#9B59B6', '#EB459E', '#1ABC9C', '#E67E22']

function generateRandomAvatar() {
  const index = Math.floor(Math.random() * AVATAR_COLORS.length)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return {
    avatarBg: AVATAR_COLORS[index],
    authorColor: AVATAR_COLORS_HEX[index],
    avatarLetter: letters[Math.floor(Math.random() * letters.length)],
  }
}

export function CommentSection({
  postId,
  postAuthor,
  postAuthorColor,
  postAvatarLetter,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [userLevel, setUserLevel] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // State for plus menu
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch Auth Status
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUserLevel(data.user.level)
          setNickname(data.user.nickname)
        } else {
          setUserLevel(4)
          const stored = localStorage.getItem('guest_id') || '게스트#0001'
          setNickname(stored)
        }
      })
      .catch(console.error)
  }, [])

  // No need for nickname localstorage save as it's handled by API/Guest logic natively


  // Refresh comments
  const refreshComments = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  // Auto-refresh comments every 10 seconds
  useEffect(() => {
    const interval = setInterval(refreshComments, 10000)
    return () => clearInterval(interval)
  }, [refreshComments])

  // Close plus menu if clicking outside
  useEffect(() => {
    const handleClick = () => setShowPlusMenu(false)
    if (showPlusMenu) {
      setTimeout(() => window.addEventListener('click', handleClick), 0)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [showPlusMenu])

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    const avatar = generateRandomAvatar()

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
          authorNickname: nickname || '방문자',
          authorPassword: password, // For guests
          isAuth: userLevel !== 4
        }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments((prev) => [comment, ...prev])
        setNewComment('')
      } else {
        const err = await res.json()
        setError(err.error || '댓글 작성에 실패했습니다')
      }
    } catch {
      setError('댓글 작성 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })
  }

  const handleDeleteClick = (id: number) => {
    if (userLevel === 0 || userLevel === 3) {
      // Direct delete check
      if (confirm('이 댓글을 삭제하시겠습니까?')) {
        executeDelete(id, null)
      }
    } else {
      // Guest needs password
      setCommentToDelete(id)
      setDeleteModalOpen(true)
    }
  }

  const executeDelete = async (id: number, pwd: string | null) => {
    try {
      const url = pwd ? `/api/comments?id=${id}&password=${encodeURIComponent(pwd)}` : `/api/comments?id=${id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id))
        setDeleteModalOpen(false)
        setDeletePassword('')
      } else {
        const err = await res.json()
        setDeleteError(err.error || '삭제 실패')
        if (pwd) alert(err.error)
      }
    } catch {
      alert('네트워크 오류')
    }
  }

  return (
    <div>
      {/* Comment List */}
      {comments.length > 0 && (
        <>
          <div className="date-separator">
            <div className="date-separator-line" />
            <span className="date-separator-text">
              {isLoading ? '⏳ 새로고침 중...' : `댓글 ${comments.length}개`}
            </span>
            <div className="date-separator-line" />
          </div>

          {comments.map((comment) => (
            <div key={comment.id} className="message message-first">
              {/* Reply indicator - Discord style reply */}
              <div className="message-reply">
                <div className="message-reply-avatar" style={{ background: postAuthorColor }}>
                  {postAvatarLetter}
                </div>
                <span className="message-reply-name">{postAuthor}</span>
                <span className="message-reply-text">게시글에 답장</span>
              </div>

              {/* Comment author header */}
              <div className="message-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="message-username" style={{ color: comment.authorColor }}>
                    {comment.author}
                  </span>
                  <span className="message-timestamp">{formatTime(comment.createdAt)}</span>
                </div>
                
                {/* Delete Button */}
                <button 
                  onClick={() => handleDeleteClick(comment.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', fontSize: '11px', cursor: 'pointer' }}
                  title="수정/삭제"
                >
                  [수정/삭제]
                </button>
              </div>

              {/* Comment content */}
              <div className="message-content">{comment.content}</div>

              {/* Avatar positioned absolutely like Discord */}
              <div className={`message-avatar ${comment.avatarBg}`} style={{ position: 'absolute', left: 16, top: 8 }}>
                {comment.avatarLetter}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Comment Input Form - Discord Chat Input Style */}
      <div style={{ padding: '0 16px 24px', flexShrink: 0 }}>
        <form onSubmit={handleSubmit}>
          {/* Guest Auth Fields */}
          {userLevel === 4 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 (미입력시 '게스트')"
                maxLength={20}
                required
                style={{
                  width: '140px', padding: '6px 10px',
                  background: 'var(--dc-bg-tertiary)', border: 'none',
                  borderRadius: 4, color: 'var(--dc-text-normal)', fontSize: 12, outline: 'none'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="댓글 삭제용 임시 비밀번호 (필수)"
                required
                style={{
                  width: '220px', padding: '6px 10px',
                  background: 'var(--dc-bg-tertiary)', border: 'none',
                  borderRadius: 4, color: 'var(--dc-text-normal)', fontSize: 12, outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--dc-bg-accent)', borderRadius: 8,
            padding: '8px 16px', minHeight: 44, position: 'relative'
          }}>
            {/* Pop up menu for + button */}
            {showPlusMenu && (
              <div style={{ position: 'absolute', bottom: '100%', left: '16px', background: 'var(--dc-bg-secondary)', padding: '8px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', zIndex: 50, border: '1px solid var(--dc-bg-tertiary)', marginBottom: '8px' }}>
                <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => {
                  if (textareaRef.current) {
                    const insertText = '![사진설명](http://사진링크)'
                    setNewComment((prev) => prev + insertText)
                    setTimeout(() => {
                      textareaRef.current?.focus()
                      textareaRef.current?.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
                    }, 0)
                  }
                  // 메뉴 닫기
                  setShowPlusMenu(false)
                }}>
                  <span style={{ fontSize: 18 }}>🖼️</span>
                  <span style={{ color: 'var(--dc-text-normal)' }}>사진 업로드</span>
                </div>
                <div style={{ padding: '10px 12px', fontSize: 14, cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-bg-modifier" onClick={() => {
                  if (textareaRef.current) {
                    const insertText = '[텍스트](http://링크)'
                    setNewComment((prev) => prev + insertText)
                    setTimeout(() => {
                      textareaRef.current?.focus()
                      textareaRef.current?.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
                    }, 0)
                  }
                  // 메뉴 닫기
                  setShowPlusMenu(false)
                }}>
                  <span style={{ fontSize: 18 }}>🔗</span>
                  <span style={{ color: 'var(--dc-text-normal)' }}>하이퍼링크 삽입</span>
                </div>
              </div>
            )}

            {/* Left '+' button */}
            <button
              type="button"
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--dc-interactive-normal)', color: 'var(--dc-bg-secondary)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 'bold', cursor: 'pointer', flexShrink: 0
              }}
              title="확장 메뉴"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
            >
              ＋
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={`스레드에 댓글 남기기`}
              disabled={isSubmitting}
              maxLength={2000}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'var(--dc-text-normal)',
                fontSize: 15, lineHeight: 1.5, resize: 'none', outline: 'none', padding: '2px 0',
                maxHeight: 120, fontFamily: 'inherit'
              }}
              rows={1}
            />

            {/* Right Side Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--dc-interactive-normal)' }}>
              {/* Send Button */}
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting || (userLevel === 4 && (!nickname || !password))}
                style={{
                  background: 'none', border: 'none',
                  cursor: (!newComment.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', padding: 0
                }}
                title="보내기 (Enter)"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={newComment.trim() ? '#ffffff' : 'var(--dc-text-muted)'} style={{ transition: 'fill 0.2s ease' }}>
                  <path d="M2.01 21l20.99-9-20.99-9-.01 7 15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>

          
          {error && (
            <div style={{ marginTop: 8, color: 'var(--dc-text-danger)', fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Delete Password Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--dc-bg-secondary)', padding: '24px', borderRadius: '8px',
            width: '300px', color: 'var(--dc-text-normal)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>댓글 삭제</h3>
            <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', marginBottom: '12px' }}>
              비회원으로 작성한 댓글입니다. 삭제용 비밀번호를 입력해주세요.
            </p>
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                style={{ background: 'none', color: 'var(--dc-text-muted)', border: 'none', cursor: 'pointer' }}>취소</button>
              <button 
                onClick={() => executeDelete(commentToDelete!, deletePassword)}
                style={{ background: '#ed4245', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
