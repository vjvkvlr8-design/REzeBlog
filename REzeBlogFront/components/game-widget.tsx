// Game Widget - 플로팅 팝업 게임 위젯 (Zustand 리팩토링)
// 사이드바/메뉴에서 제거, 드래그 가능한 팝업으로 표시
// 작성일: 2026-04-20 (Zustand Migration)

'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useGameStore, gameData, type GameChoice } from '@/stores/game-store'
import { useRouter } from 'next/navigation'

export function GameWidget() {
  const router = useRouter()
  const widgetRef = useRef<HTMLDivElement>(null)
  
  // Local state for UI only (position, dragging)
  const [position, setPosition] = useState({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Zustand state
  const {
    progress,
    saveSlots,
    isOpen,
    isMinimized,
    showInventory,
    showSaveMenu,
    currentGame,
    setIsOpen,
    setIsMinimized,
    setShowInventory,
    setShowSaveMenu,
    makeChoice,
    resetGame,
    saveGame,
    loadGame,
    getShareableContent,
  } = useGameStore()

  // Initialize position on mount
  useEffect(() => {
    if (position.x === -1) {
      setPosition({
        x: window.innerWidth - 380,
        y: window.innerHeight - 450,
      })
    }
  }, [position.x])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (widgetRef.current) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }, [position])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 340, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y)),
        })
      }
    }
    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  if (!isOpen) {
    return (
      <button
        className="game-widget-toggle"
        onClick={() => setIsOpen(true)}
        title="🎮 텍스트 게임"
        aria-label="텍스트 게임 열기"
      >
        🎮
      </button>
    )
  }

  return (
    <div
      ref={widgetRef}
      className={`game-widget ${isMinimized ? 'minimized' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 200 : 340,
        height: isMinimized ? 40 : 400,
      }}
    >
      {/* Header - draggable */}
      <div className="game-widget-header" onMouseDown={handleMouseDown}>
        <div className="game-widget-title">
          <span>🎮</span> 텍스트 어드벤처
        </div>
        <div className="game-widget-controls">
          <button
            className="game-widget-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? '확장' : '최소화'}
          >
            {isMinimized ? '□' : '—'}
          </button>
          <button
            className="game-widget-btn"
            onClick={() => setIsOpen(false)}
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="game-widget-body" style={{ height: 'calc(100% - 40px)' }}>
          {/* Game text */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>턴 {progress.turn}</span>
              <span>❤️ {progress.health} | 🧠 {progress.sanity}</span>
            </div>
            {currentGame.text.map((line, i) => (
              <p
                key={i}
                className="animate-fadein"
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 4,
                  color: 'var(--dc-text-normal)',
                  animationDelay: `${i * 0.2}s`,
                  animationFillMode: 'both',
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              className="game-choice"
              onClick={resetGame}
              style={{ flex: 1, fontSize: 12 }}
            >
              🔄 새 게임
            </button>
            <button
              className="game-choice"
              onClick={() => setShowInventory(!showInventory)}
              style={{ flex: 1, fontSize: 12 }}
            >
              🎒 인벤토리 ({progress.inventory.length})
            </button>
            <button
              className="game-choice"
              onClick={() => setShowSaveMenu(true)}
              style={{ flex: 1, fontSize: 12 }}
            >
              💾 저장/불러오기
            </button>
            {(progress.flags['true_ending'] || progress.flags['system_ending']) && (
              <button
                className="game-choice"
                onClick={async () => {
                  const { title, content } = getShareableContent()
                  try {
                    await navigator.clipboard.writeText(`${title}\n\n${content}`)
                    alert('엔딩 복사 완료! 댓글이나 커뮤니티에 공유해보세요.')
                  } catch (e) {
                    alert('복사에 실패했습니다. 권한을 확인해주세요.')
                  }
                }}
                style={{ flex: 1, fontSize: 12, background: 'var(--dc-accent)' }}
              >
                📋 내용 복사
              </button>
            )}
          </div>

          {/* Inventory Menu */}
          {showInventory && (
            <div style={{
              background: 'var(--dc-bg-tertiary)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              maxHeight: 150,
              overflow: 'auto',
            }}>
              <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', marginBottom: 8 }}>인벤토리</div>
              {progress.inventory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {progress.inventory.map((item, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--dc-text-normal)' }}>
                      • {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--dc-text-muted)' }}>비어있음</div>
              )}
              {progress.discovered.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', marginTop: 8, marginBottom: 4 }}>발견한 것들</div>
                  <div style={{ fontSize: 11, color: 'var(--dc-text-secondary)' }}>
                    {progress.discovered.join(', ')}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Save/Load Menu */}
          {showSaveMenu && (
            <div style={{
              background: 'var(--dc-bg-tertiary)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              maxHeight: 150,
              overflow: 'auto',
            }}>
              <div style={{ fontSize: 11, color: 'var(--dc-text-muted)', marginBottom: 8 }}>저장 슬롯</div>
              {[1, 2, 3].map(slot => {
                const save = saveSlots.find(s => s.slot === slot)
                return (
                  <div key={slot} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, width: 20 }}>{slot}.</span>
                    {save ? (
                      <>
                        <span style={{ fontSize: 12, flex: 1, color: 'var(--dc-text-normal)' }}>
                          {save.name}
                        </span>
                        <button className="game-choice" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => loadGame(slot)}>
                          불러오기
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, flex: 1, color: 'var(--dc-text-muted)' }}>빈 슬롯</span>
                    )}
                    <button className="game-choice" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => saveGame(slot)}>
                      저장
                    </button>
                  </div>
                )
              })}
              {saveSlots.find(s => s.slot === 0) && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--dc-separator)' }}>
                  <button className="game-choice" style={{ width: '100%', fontSize: 11 }} onClick={() => loadGame(0)}>
                    🔄 자동 저장 불러오기 (턴 {saveSlots.find(s => s.slot === 0)?.turn})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Choices */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              color: 'var(--dc-text-muted)',
              marginBottom: 6,
              letterSpacing: '0.02em',
            }}>
              선택지
            </div>
            {currentGame.choices.map((choice, i) => (
              <button
                key={i}
                className="game-choice"
                disabled={choice.disabled || (choice.condition && !choice.condition(progress))}
                onClick={() => makeChoice(choice)}
              >
                <span style={{ marginRight: 6 }}>{choice.emoji}</span>
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
