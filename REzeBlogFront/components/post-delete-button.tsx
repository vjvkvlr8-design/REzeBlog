'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from './admin/markdown-editor'

export function PostDeleteButton({ postId, postAuthor }: { postId: number; postAuthor: string }) {
  const router = useRouter()
  const [userLevel, setUserLevel] = useState(4)
  const [userNickname, setUserNickname] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editExcerpt, setEditExcerpt] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editAttachments, setEditAttachments] = useState<{id: string, data: string}[]>([])

  const extractImages = (text: string) => {
    const attachments: {id: string, data: string}[] = []
    const newText = text.replace(/!\[.*?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g, (match, data) => {
      const id = Math.random().toString(36).substr(2, 6)
      attachments.push({ id, data })
      return `[사진: ${id}]`
    })
    return { newText, attachments }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUserLevel(data.user.level)
          setUserNickname(data.user.nickname)
        }
      })
      .catch(() => {})
  }, [])

  const handleDeleteClick = () => {
    if (userLevel === 0 || (userLevel === 3 && userNickname === postAuthor)) {
      if (confirm('이 게시글을 삭제하시겠습니까? (연결된 댓글도 모두 삭제됩니다)')) {
        executeDelete(null)
      }
    } else if (userLevel === 4) {
      setDeleteModalOpen(true)
    } else {
      alert('삭제 권한이 없습니다.')
    }
  }

  const executeDelete = async (pwd: string | null) => {
    try {
      const url = pwd ? `/api/posts?id=${postId}&password=${encodeURIComponent(pwd)}` : `/api/posts?id=${postId}`
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        alert('게시글이 삭제되었습니다.')
        router.push('/blog')
      } else {
        const err = await res.json()
        alert(err.error || '삭제 실패')
      }
    } catch {
      alert('네트워크 오류')
    }
  }

  const handleEditClick = async () => {
    if (userLevel === 0 || (userLevel === 3 && userNickname === postAuthor)) {
      // Fetch current post content
      try {
        const res = await fetch(`/api/posts?id=${postId}`)
        if (res.ok) {
          const data = await res.json()
          const post = data.find((p: any) => p.id === postId)
          if (post) {
            const { newText, attachments } = extractImages(post.content)
            setEditAttachments(attachments)
            setEditTitle(post.title)
            setEditExcerpt(post.excerpt || '')
            setEditContent(newText)
            setEditModalOpen(true)
          }
        }
      } catch (e) {}
    } else if (userLevel === 4) {
      // For guests, we need password before fetching or just fetch and require password on submit
      try {
        const res = await fetch(`/api/posts?id=${postId}`)
        if (res.ok) {
          const data = await res.json()
          const post = data.find((p: any) => p.id === postId)
          if (post) {
            const { newText, attachments } = extractImages(post.content)
            setEditAttachments(attachments)
            setEditTitle(post.title)
            setEditExcerpt(post.excerpt || '')
            setEditContent(newText)
            setEditModalOpen(true)
          }
        }
      } catch (e) {}
    } else {
      alert('수정 권한이 없습니다.')
    }
  }

  const executeEdit = async () => {
    try {
      let finalContent = editContent
      editAttachments.forEach(att => {
        finalContent = finalContent.replace(`[사진: ${att.id}]`, `![업로드된 이미지](${att.data})`)
      })

      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          title: editTitle,
          excerpt: editExcerpt,
          content: finalContent,
          password: editPassword
        })
      })
      if (res.ok) {
        alert('게시글이 수정되었습니다.')
        setEditModalOpen(false)
        window.location.reload()
      } else {
        const err = await res.json()
        alert(err.error || '수정 실패')
      }
    } catch {
      alert('네트워크 오류')
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={handleEditClick}
          style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', fontSize: '11px', cursor: 'pointer' }}
          title="게시글 수정"
        >
          [수정]
        </button>
        <button 
          onClick={handleDeleteClick}
          style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', fontSize: '11px', cursor: 'pointer' }}
          title="게시글 삭제"
        >
          [삭제]
        </button>
      </div>

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
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>게시글 삭제</h3>
            <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', marginBottom: '12px' }}>
              비회원으로 작성한 게시글입니다. 삭제용 비밀번호를 입력해주세요.
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
                onClick={() => executeDelete(deletePassword)}
                style={{ background: '#ed4245', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--dc-bg-primary)', padding: '24px', borderRadius: '8px',
            width: '900px', maxWidth: '95%', maxHeight: '90vh', color: 'var(--dc-text-normal)', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--dc-header-primary)', fontSize: '20px' }}>게시글 수정</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
            </div>
            
            {editAttachments.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '8px', borderBottom: '1px solid var(--dc-bg-tertiary)' }}>
                {editAttachments.map((att) => (
                  <div key={att.id} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--dc-interactive-muted)' }}>
                    <img src={att.data} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setEditAttachments(prev => prev.filter(a => a.id !== att.id))}
                      style={{
                        position: 'absolute', top: 2, right: 2, width: 16, height: 16,
                        borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: 10
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: 4 }}>제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="제목"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: 'var(--dc-text-normal)', fontSize: '15px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: 4 }}>태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="예: REze블로그, 여고생입니다"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: 'var(--dc-text-normal)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: 4 }}>요약 (미입력시 자동 생성)</label>
              <input
                type="text"
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                placeholder="글의 간단한 요약을 입력하세요"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: 'var(--dc-text-normal)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: 4 }}>본문</label>
              <div style={{ borderRadius: '8px', border: '1px solid var(--dc-bg-tertiary)', overflow: 'hidden' }}>
                <MarkdownEditor
                  value={editContent}
                  onChange={setEditContent}
                  attachments={editAttachments}
                  setAttachments={setEditAttachments}
                  minHeight={250}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
              <div>
                {userLevel === 4 && (
                  <input 
                    type="password" 
                    placeholder="수정용 비밀번호 (필수)" 
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    style={{ width: '200px', padding: '10px', background: 'var(--dc-bg-tertiary)', border: 'none', borderRadius: '4px', color: '#fff' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setEditModalOpen(false)}
                  style={{ background: 'none', color: 'var(--dc-text-muted)', border: 'none', cursor: 'pointer', padding: '10px 16px' }}>취소</button>
                <button 
                  onClick={executeEdit}
                  style={{ background: 'var(--dc-brand)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
