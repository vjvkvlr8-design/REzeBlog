'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from './admin/markdown-editor'

interface PostActionsProps {
  postId: string
  slug: string
  initialData: {
    title: string
    content: string
    tags?: string
    summary?: string
  }
}

export function PostActions({ postId, slug, initialData }: PostActionsProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit form state
  const [title, setTitle] = useState(initialData.title)
  const [content, setContent] = useState(initialData.content)
  const [tags, setTags] = useState(initialData.tags || '')
  const [summary, setSummary] = useState(initialData.summary || '')
  const [attachments, setAttachments] = useState<{id: string, data: string}[]>([])

  useEffect(() => {
    // Check admin status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user.level === 0) {
          setIsAdmin(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/posts?id=${postId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/admin/posts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(postId),
          title,
          content,
          tags,
          summary,
          attachments
        })
      })
      
      if (res.ok) {
        setIsEditModalOpen(false)
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || '수정 중 오류가 발생했습니다.')
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.')
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <div className="post-actions-inline" style={{ 
        display: 'inline-flex', 
        gap: '6px', 
        marginLeft: '4px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--dc-interactive-normal)',
        verticalAlign: 'middle'
      }}>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="post-action-btn"
          style={{ background: 'none', border: 'none', padding: '0 2px', color: 'inherit', cursor: 'pointer', transition: 'color 0.1s' }}
        >
          [수정]
        </button>
        <button 
          onClick={handleDelete}
          className="post-action-btn"
          disabled={isDeleting}
          style={{ background: 'none', border: 'none', padding: '0 2px', color: 'inherit', cursor: 'pointer', transition: 'color 0.1s' }}
        >
          {isDeleting ? '[삭제 중...]' : '[삭제]'}
        </button>
      </div>

      <style jsx>{`
        .post-action-btn:hover {
          color: var(--dc-interactive-active) !important;
        }
      `}</style>

      {isEditModalOpen && (
        <div className="edit-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="edit-modal-content" style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            background: 'var(--dc-bg-secondary)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div className="edit-modal-header" style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--dc-separator)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>게시글 수정</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="edit-modal-body" style={{ 
              padding: '24px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Title & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--dc-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>제목</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff' }}
                    placeholder="제목을 입력하세요"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--dc-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>태그 (쉼표 구분)</label>
                  <input 
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff' }}
                    placeholder="예: REze블로그, 개발"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--dc-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>요약</label>
                <textarea 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff', minHeight: '60px' }}
                  placeholder="간단한 요약을 입력하세요"
                />
              </div>

              {/* Advanced Content Editor */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--dc-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>본문</label>
                <MarkdownEditor 
                  value={content}
                  onChange={setContent}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  minHeight={300}
                />
              </div>
            </div>

            <div className="edit-modal-footer" style={{
              padding: '16px 24px',
              background: 'var(--dc-bg-tertiary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ padding: '8px 16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                취소
              </button>
              <button 
                onClick={handleUpdate}
                style={{ padding: '8px 24px', background: 'var(--dc-bg-accent)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
