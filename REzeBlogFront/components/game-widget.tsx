// Game Widget - 플로팅 팝업 게임 위젯
// 사이드바/메뉴에서 제거, 드래그 가능한 팝업으로 표시
// 작성일: 2026-04-19 (Antigravity)

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface GameState {
  stage: string
  text: string[]
  choices: { label: string; emoji: string; nextStage: string; disabled?: boolean }[]
  turn: number
}

interface SaveSlot {
  slot: number
  name: string
  stage: string
  turn: number
  savedAt: string
}

const STORAGE_KEY = 'rezeblog-game-save'

const gameData: Record<string, GameState> = {
  intro: {
    stage: 'intro',
    text: ['주변은 온통 어둠입니다.', '아무것도 보이지 않습니다...'],
    choices: [
      { label: '불을 밝힌다', emoji: '🔥', nextStage: 'light' },
      { label: '기다린다', emoji: '⏳', nextStage: 'wait' },
      { label: '???', emoji: '❓', nextStage: '', disabled: true },
    ],
    turn: 1,
  },
  light: {
    stage: 'light',
    text: ['불빛이 주변을 비춥니다.', '오래된 책상과 컴퓨터가 보입니다.', '화면에 무언가 깜빡이고 있습니다.'],
    choices: [
      { label: '컴퓨터를 확인한다', emoji: '💻', nextStage: 'computer' },
      { label: '주변을 더 살핀다', emoji: '👀', nextStage: 'look' },
    ],
    turn: 2,
  },
  wait: {
    stage: 'wait',
    text: ['어둠 속에서 기다립니다...', '"삐-" 어디선가 소리가 들립니다.', '기계음이 점점 가까워집니다.'],
    choices: [
      { label: '소리를 따라간다', emoji: '👂', nextStage: 'computer' },
      { label: '가만히 있는다', emoji: '🧘', nextStage: 'intro' },
    ],
    turn: 2,
  },
  computer: {
    stage: 'computer',
    text: [
      '화면에 메시지가 표시됩니다:',
      '"REzeBlog에 오신 것을 환영합니다"',
      '"블로그 게시글을 읽으며 이야기를 발견하세요"',
    ],
    choices: [
      { label: '블로그로 돌아간다', emoji: '📖', nextStage: 'intro' },
    ],
    turn: 3,
  },
  look: {
    stage: 'look',
    text: ['벽에 포스트잇이 붙어있습니다.', '"Next.js 14 + PostgreSQL"', '"SEO 최적화 필수"', '개발 메모인 것 같습니다.'],
    choices: [
      { label: '컴퓨터로 돌아간다', emoji: '💻', nextStage: 'computer' },
      { label: '처음부터', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 3,
  },
}

export function GameWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStage, setCurrentStage] = useState('intro')
  const [position, setPosition] = useState({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const widgetRef = useRef<HTMLDivElement>(null)

  const game = gameData[currentStage] || gameData.intro

  // Load save slots from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const slots = JSON.parse(saved) as SaveSlot[]
        setSaveSlots(slots)
      } catch {
        setSaveSlots([])
      }
    }
  }, [])

  // Initialize position on mount
  useEffect(() => {
    if (position.x === -1) {
      setPosition({
        x: window.innerWidth - 380,
        y: window.innerHeight - 450,
      })
    }
  }, [position.x])

  // Save game to slot
  const saveGame = useCallback((slot: number, name?: string) => {
    const newSave: SaveSlot = {
      slot,
      name: name || `저장 ${slot} (턴 ${game.turn})`,
      stage: currentStage,
      turn: game.turn,
      savedAt: new Date().toISOString(),
    }
    const updated = [...saveSlots.filter(s => s.slot !== slot), newSave].sort((a, b) => a.slot - b.slot)
    setSaveSlots(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [currentStage, game.turn, saveSlots])

  // Load game from slot
  const loadGame = useCallback((slot: number) => {
    const save = saveSlots.find(s => s.slot === slot)
    if (save && gameData[save.stage]) {
      setCurrentStage(save.stage)
      setShowSaveMenu(false)
    }
  }, [saveSlots])

  // Auto save on stage change
  useEffect(() => {
    if (currentStage !== 'intro') {
      saveGame(0, '자동 저장')
    }
  }, [currentStage, saveGame])

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
            <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginBottom: 8 }}>
              턴 {game.turn}
            </div>
            {game.text.map((line, i) => (
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

          {/* Save/Load buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              className="game-choice"
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              style={{ flex: 1, fontSize: 12 }}
            >
              💾 저장/불러오기
            </button>
          </div>

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
            {game.choices.map((choice, i) => (
              <button
                key={i}
                className="game-choice"
                disabled={choice.disabled}
                onClick={() => !choice.disabled && setCurrentStage(choice.nextStage)}
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
