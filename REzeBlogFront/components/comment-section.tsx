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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load nickname from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rezeblog-nickname')
    if (saved) setNickname(saved)
  }, [])

  // Save nickname to localStorage
  useEffect(() => {
    if (nickname) localStorage.setItem('rezeblog-nickname', nickname)
  }, [nickname])

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
          author: nickname.trim() || '방문자',
          authorColor: avatar.authorColor,
          avatarBg: avatar.avatarBg,
          avatarLetter: avatar.avatarLetter,
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
      <div style={{ padding: '16px' }}>
        <form onSubmit={handleSubmit}>
          {/* Nickname input */}
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 (선택사항)"
              maxLength={20}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--dc-bg-secondary)',
                border: '1px solid var(--dc-separator)',
                borderRadius: 4,
                color: 'var(--dc-text-normal)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Comment textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="이 스레드에 답장하기..."
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 44px 12px 12px',
                background: 'var(--dc-bg-secondary)',
                border: '1px solid var(--dc-separator)',
                borderRadius: 8,
                color: 'var(--dc-text-normal)',
                fontSize: 14,
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              style={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                padding: '6px 12px',
                background: newComment.trim() && !isSubmitting ? 'var(--dc-accent)' : 'var(--dc-bg-tertiary)',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13,
                cursor: newComment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? '⏳' : '보내기'}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ marginTop: 8, color: 'var(--dc-red)', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Character count */}
          <div style={{ marginTop: 4, textAlign: 'right', fontSize: 12, color: 'var(--dc-text-muted)' }}>
            {newComment.length}/1000
          </div>
        </form>
      </div>
    </div>
  )
}
