'use client'

import { useState, useRef, useCallback } from 'react'
import DOMPurify from 'dompurify'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운으로 글을 작성하세요...',
  minHeight = 400,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 텍스트 영역에 포커스
  const focusTextarea = () => {
    textareaRef.current?.focus()
  }

  // 선택 영역 가져오기
  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value.substring(start, end)
    
    return { start, end, text }
  }

  // 텍스트 삽입
  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { start, end, text } = getSelection()
    const newValue = value.substring(0, start) + before + text + after + value.substring(end)
    
    onChange(newValue)
    
    // 커서 위치 재설정
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  // 서식 적용
  const applyFormat = (type: 'bold' | 'italic' | 'code' | 'codeblock' | 'heading' | 'link' | 'image' | 'list' | 'quote') => {
    const { text } = getSelection()
    
    switch (type) {
      case 'bold':
        insertText('**', '**')
        break
      case 'italic':
        insertText('*', '*')
        break
      case 'code':
        insertText('`', '`')
        break
      case 'codeblock':
        insertText('```typescript\n', '\n```')
        break
      case 'heading':
        insertText('## ', '')
        break
      case 'link':
        insertText('[', '](https://example.com)')
        break
      case 'image':
        insertText('![alt text](', ')')
        break
      case 'list':
        insertText('- ', '')
        break
      case 'quote':
        insertText('> ', '')
        break
    }
  }

  // 이미지 파일 업로드 처리
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 이미지를 Base64로 변환
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      insertText(`![${file.name}](${base64})`)
    }
    reader.readAsDataURL(file)
  }

  // 드래그 앤 드롭 처리
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // 파일 입력 처리
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // 툴바 버튼 스타일
  const toolbarButtonStyle = {
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid var(--dc-separator)',
    background: 'var(--dc-bg-tertiary)',
    color: 'var(--dc-text-normal)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s',
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 툴바 */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        background: 'var(--dc-bg-secondary)',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid var(--dc-separator)',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* 텍스트 서식 */}
        <button
          onClick={() => applyFormat('bold')}
          style={toolbarButtonStyle}
          title="굵게 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => applyFormat('italic')}
          style={toolbarButtonStyle}
          title="기울임 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        
        <div style={{ width: 1, height: 24, background: 'var(--dc-separator)', margin: '0 4px' }} />
        
        {/* 헤딩 */}
        <button
          onClick={() => applyFormat('heading')}
          style={toolbarButtonStyle}
          title="제목"
        >
          H
        </button>
        
        {/* 코드 */}
        <button
          onClick={() => applyFormat('code')}
          style={toolbarButtonStyle}
          title="인라인 코드"
        >
          {'</>'}
        </button>
        <button
          onClick={() => applyFormat('codeblock')}
          style={toolbarButtonStyle}
          title="코드 블록"
        >
          {'{ }'}
        </button>
        
        <div style={{ width: 1, height: 24, background: 'var(--dc-separator)', margin: '0 4px' }} />
        
        {/* 리스트 */}
        <button
          onClick={() => applyFormat('list')}
          style={toolbarButtonStyle}
          title="목록"
        >
          ☰
        </button>
        <button
          onClick={() => applyFormat('quote')}
          style={toolbarButtonStyle}
          title="인용"
        >
          ❝
        </button>
        
        {/* 링크 */}
        <button
          onClick={() => applyFormat('link')}
          style={toolbarButtonStyle}
          title="링크"
        >
          🔗
        </button>
        
        {/* 이미지 업로드 */}
        <label style={{ ...toolbarButtonStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          📷
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
        
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--dc-text-muted)' }}>
          {value.length}자 | Markdown 지원
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: 'relative',
          border: isDragging 
            ? '2px dashed #03c75a' 
            : '1px solid var(--dc-separator)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          background: isDragging ? 'rgba(3,199,90,0.1)' : 'var(--dc-bg-tertiary)',
          transition: 'all 0.2s',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: minHeight,
            padding: 20,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontSize: 15,
            lineHeight: 1.8,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            color: 'var(--dc-text-normal)',
            background: 'transparent',
          }}
        />
        
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '0 0 8px 8px',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
          }}>
            📷 이미지를 여기에 드롭하세요
          </div>
        )}
      </div>

      {/* 미리보기 토글 */}
      {value && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: 'var(--dc-header-primary)',
            marginBottom: 12,
          }}>
            👁️ 미리보기
          </h4>
          <div
            style={{
              padding: 20,
              background: 'var(--dc-bg-secondary)',
              borderRadius: 8,
              border: '1px solid var(--dc-separator)',
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--dc-text-normal)',
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(renderMarkdown(value)),
            }}
          />
        </div>
      )}
    </div>
  )
}

// 간단한 마크다운 렌더링 함수
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3 style="color:var(--dc-header-primary);margin:16px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:var(--dc-header-primary);margin:20px 0 12px;border-bottom:1px solid var(--dc-separator);padding-bottom:8px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:var(--dc-header-primary);margin:24px 0 16px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--dc-bg-tertiary);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#1e1e1e;padding:16px;border-radius:8px;overflow-x:auto;margin:12px 0;"><code style="font-family:monospace;font-size:13px;color:#d4d4d4;">$2</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#00aff4;text-decoration:none;">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:12px 0;" />')
    .replace(/^- (.*$)/gim, '<li style="margin:4px 0;">$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #faa81a;margin:12px 0;padding:8px 16px;background:var(--dc-bg-tertiary);color:var(--dc-text-muted);">$1</blockquote>')
    .replace(/\n/g, '<br />')
}
