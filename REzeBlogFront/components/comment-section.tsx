'use client'

import { useState, useCallback, useEffect } from 'react'

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
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
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
              <div className="message-header">
                <span className="message-username" style={{ color: comment.authorColor }}>
                  {comment.author}
                </span>
                <span className="message-timestamp">{formatTime(comment.createdAt)}</span>
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
            {/* Left '+' button */}
            <button
              type="button"
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--dc-interactive-normal)', color: 'var(--dc-bg-secondary)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 'bold', cursor: 'pointer', flexShrink: 0
              }}
              title="첨부파일 (개발중)"
              onClick={() => alert('사진 모달 등 확장 기능 예정')}
            >
              ＋
            </button>

            {/* Textarea */}
            <textarea
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
    </div>
  )
}
