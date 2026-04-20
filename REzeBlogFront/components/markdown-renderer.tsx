'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // XSS 방지: 입력 컨텐츠 사전 정화
  const sanitizedContent = useMemo(() => {
    if (typeof window === 'undefined') return content
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'title', 'target']
    })
  }, [content])

  const renderedContent = useMemo(() => {
    const lines = sanitizedContent.split('\n')
    const elements: JSX.Element[] = []
    let i = 0
    let listItems: string[] = []
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLang = ''

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${i}`} style={{ margin: '8px 0', paddingLeft: 20 }}>
            {listItems.map((item, idx) => (
              <li key={idx} style={{ color: 'var(--dc-text-normal)', lineHeight: 1.6, margin: '4px 0' }}>
                {renderInlineMarkdown(item.slice(2))}
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre
            key={`code-${i}`}
            style={{
              background: '#1e1e1e',
              borderRadius: 8,
              padding: 16,
              margin: '12px 0',
              overflowX: 'auto',
              border: '1px solid var(--dc-separator)',
            }}
          >
            <code
              style={{
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                fontSize: 13,
                color: '#d4d4d4',
                lineHeight: 1.5,
                whiteSpace: 'pre',
              }}
            >
              {codeBlockContent.join('\n')}
            </code>
            {codeBlockLang && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  fontSize: 11,
                  color: 'var(--dc-text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {codeBlockLang}
              </div>
            )}
          </pre>
        )
        codeBlockContent = []
        codeBlockLang = ''
        inCodeBlock = false
      }
    }

    while (i < lines.length) {
      const line = lines[i]

      // 코드 블록 처리
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushList()
          inCodeBlock = true
          codeBlockLang = line.slice(3).trim()
        } else {
          flushCodeBlock()
        }
        i++
        continue
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        i++
        continue
      }

      // 빈 줄 처리
      if (line === '') {
        flushList()
        elements.push(<div key={`br-${i}`} style={{ height: 8 }} />)
        i++
        continue
      }

      // 헤딩 처리
      if (line.startsWith('# ')) {
        flushList()
        elements.push(
          <h1
            key={`h1-${i}`}
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--dc-header-primary)',
              margin: '24px 0 16px',
              borderBottom: '2px solid var(--dc-brand)',
              paddingBottom: 8,
            }}
          >
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        )
        i++
        continue
      }

      if (line.startsWith('## ')) {
        flushList()
        elements.push(
          <h2
            key={`h2-${i}`}
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--dc-header-primary)',
              margin: '20px 0 12px',
              borderBottom: '1px solid var(--dc-separator)',
              paddingBottom: 6,
            }}
          >
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        )
        i++
        continue
      }

      if (line.startsWith('### ')) {
        flushList()
        elements.push(
          <h3
            key={`h3-${i}`}
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--dc-header-primary)',
              margin: '16px 0 8px',
            }}
          >
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        )
        i++
        continue
      }

      // 인용구 처리
      if (line.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote
            key={`quote-${i}`}
            style={{
              borderLeft: '4px solid #faa81a',
              margin: '12px 0',
              padding: '8px 16px',
              background: 'var(--dc-bg-tertiary)',
              borderRadius: '0 8px 8px 0',
              color: 'var(--dc-text-muted)',
              fontStyle: 'italic',
            }}
          >
            {renderInlineMarkdown(line.slice(2))}
          </blockquote>
        )
        i++
        continue
      }

      // 리스트 아이템 처리
      if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(line)
        i++
        continue
      }

      // 번호 있는 리스트
      const numberedListMatch = line.match(/^(\d+)\.\s(.+)$/)
      if (numberedListMatch) {
        flushList()
        elements.push(
          <div key={`ol-${i}`} style={{ paddingLeft: 20, margin: '4px 0' }}>
            <span style={{ color: 'var(--dc-brand)', fontWeight: 700, marginRight: 8 }}>
              {numberedListMatch[1]}.
            </span>
            <span style={{ color: 'var(--dc-text-normal)', lineHeight: 1.6 }}>
              {renderInlineMarkdown(numberedListMatch[2])}
            </span>
          </div>
        )
        i++
        continue
      }

      // 일단 문단
      flushList()
      elements.push(
        <p key={`p-${i}`} style={{ color: 'var(--dc-text-normal)', lineHeight: 1.8, margin: '8px 0' }}>
          {renderInlineMarkdown(line)}
        </p>
      )
      i++
    }

    flushList()
    flushCodeBlock()

    return elements
  }, [content])

  return <div className={className}>{renderedContent}</div>
}

// 인라인 마크다운 렌더링 (볼드, 이탤릭, 인라인코드, 링크, 이미지)
function renderInlineMarkdown(text: string): JSX.Element {
  const parts: JSX.Element[] = []
  let remaining = text
  let key = 0

  // 이미지 패턴: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  // 링크 패턴: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  // 볼드 패턴: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g
  // 이탤릭 패턴: *text* 또는 _text_
  const italicRegex = /\*([^*]+)\*|_([^_]+)_/g
  // 인라인 코드 패턴: `code`
  const codeRegex = /`([^`]+)`/g

  // 모든 패턴을 하나의 regex로 결합
  const combinedRegex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g

  let lastIndex = 0
  let match

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchText = match[0]
    const matchIndex = match.index

    // 매치 전 텍스트 추가
    if (matchIndex > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, matchIndex)}</span>)
    }

    // 이미지 처리
    if (matchText.startsWith('![')) {
      const imgMatch = matchText.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (imgMatch) {
        parts.push(
          <img
            key={key++}
            src={imgMatch[2]}
            alt={imgMatch[1]}
            style={{
              maxWidth: '100%',
              borderRadius: 8,
              margin: '12px 0',
              display: 'block',
            }}
          />
        )
      }
    }
    // 링크 처리
    else if (matchText.startsWith('[')) {
      const linkMatch = matchText.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#00aff4',
              textDecoration: 'none',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
            }}
          >
            {linkMatch[1]}
          </a>
        )
      }
    }
    // 볼드 처리
    else if (matchText.startsWith('**')) {
      const boldMatch = matchText.match(/\*\*([^*]+)\*\*/)
      if (boldMatch) {
        parts.push(
          <strong key={key++} style={{ color: 'var(--dc-header-primary)', fontWeight: 700 }}>
            {renderInlineMarkdown(boldMatch[1])}
          </strong>
        )
      }
    }
    // 이탤릭 처리
    else if (matchText.startsWith('*') || matchText.startsWith('_')) {
      const italicMatch = matchText.match(/\*([^*]+)\*|_([^_]+)_/)
      const content = italicMatch?.[1] || italicMatch?.[2] || ''
      parts.push(
        <em key={key++} style={{ fontStyle: 'italic', color: 'var(--dc-text-muted)' }}>
          {renderInlineMarkdown(content)}
        </em>
      )
    }
    // 인라인 코드 처리
    else if (matchText.startsWith('`')) {
      const codeMatch = matchText.match(/`([^`]+)`/)
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            style={{
              background: 'var(--dc-bg-tertiary)',
              padding: '2px 6px',
              borderRadius: 4,
              fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
              fontSize: 13,
              color: 'var(--dc-text-normal)',
            }}
          >
            {codeMatch[1]}
          </code>
        )
      }
    }

    lastIndex = matchIndex + matchText.length
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}
