'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function PostDeleteButton({ postId, postAuthor }: { postId: number; postAuthor: string }) {
  const router = useRouter()
  const [userLevel, setUserLevel] = useState(4)
  const [userNickname, setUserNickname] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

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

  return (
    <>
      <button 
        onClick={handleDeleteClick}
        style={{ background: 'none', border: 'none', color: 'var(--dc-text-muted)', fontSize: '11px', cursor: 'pointer' }}
        title="수정/삭제"
      >
        [게시글 삭제]
      </button>

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
    </>
  )
}
