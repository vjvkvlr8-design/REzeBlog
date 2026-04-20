// Game Widget - 플로팅 팝업 게임 위젯
// 사이드바/메뉴에서 제거, 드래그 가능한 팝업으로 표시
// 작성일: 2026-04-19 (Antigravity)

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface GameState {
  stage: string
  text: string[]
  choices: { label: string; emoji: string; nextStage: string; disabled?: boolean; condition?: (state: GameProgress) => boolean }[]
  turn: number
  onEnter?: (state: GameProgress) => void
}

interface GameProgress {
  currentStage: string
  turn: number
  inventory: string[]
  health: number
  sanity: number
  discovered: string[]
  flags: Record<string, boolean>
}

interface SaveData extends GameProgress {
  timestamp: number
}

interface SaveSlot {
  slot: number
  name: string
  stage: string
  turn: number
  savedAt: string
}

const STORAGE_KEY = 'rezeblog-game-v2'

const INITIAL_PROGRESS: GameProgress = {
  currentStage: 'intro',
  turn: 1,
  inventory: [],
  health: 100,
  sanity: 100,
  discovered: [],
  flags: {},
}

const gameData: Record<string, GameState> = {
  intro: {
    stage: 'intro',
    text: ['주변은 온통 어둠입니다.', '아무것도 보이지 않습니다...', '손에 무언가 작은 물건이 들려 있습니다.'],
    choices: [
      { label: '불을 밝힌다', emoji: '🔥', nextStage: 'light' },
      { label: '기다린다', emoji: '⏳', nextStage: 'wait' },
      { label: '물건을 확인한다', emoji: '🎒', nextStage: 'check-item' },
    ],
    turn: 1,
  },
  'check-item': {
    stage: 'check-item',
    text: ['손에는 작은 라이터가 들려 있습니다.', '라이터를 얻었습니다!'],
    choices: [
      { label: '라이터로 불을 밝힌다', emoji: '🔥', nextStage: 'light' },
      { label: '어둠 속에서 기다린다', emoji: '⏳', nextStage: 'wait' },
    ],
    turn: 1,
    onEnter: (state) => { state.inventory.push('라이터'); state.discovered.push('라이터'); },
  },
  light: {
    stage: 'light',
    text: ['불빛이 주변을 비춥니다.', '오래된 책상과 컴퓨터가 보입니다.', '화면에 무언가 깜빡이고 있습니다.'],
    choices: [
      { label: '컴퓨터를 확인한다', emoji: '💻', nextStage: 'computer' },
      { label: '주변을 더 살핀다', emoji: '👀', nextStage: 'look' },
      { label: '책상 서랍을 연다', emoji: '🗄️', nextStage: 'drawer' },
    ],
    turn: 2,
  },
  wait: {
    stage: 'wait',
    text: ['어둠 속에서 기다립니다...', '"삐-" 어디선가 소리가 들립니다.', '기계음이 점점 가까워집니다.'],
    choices: [
      { label: '소리를 따라간다', emoji: '👂', nextStage: 'computer' },
      { label: '가만히 있는다', emoji: '🧘', nextStage: 'intro' },
      { label: '라이터를 켠다', emoji: '🔥', nextStage: 'light', condition: (s) => s.inventory.includes('라이터') },
    ],
    turn: 2,
    onEnter: (state) => { state.sanity -= 5; },
  },
  drawer: {
    stage: 'drawer',
    text: ['서랍 안에서 낡은 USB를 발견했습니다.', 'USB에 "SECRET_KEY"라고 적혀 있습니다.'],
    choices: [
      { label: 'USB를 챙긴다', emoji: '💾', nextStage: 'light' },
      { label: '무시하고 컴퓨터로 간다', emoji: '💻', nextStage: 'computer' },
    ],
    turn: 2,
    onEnter: (state) => { state.inventory.push('SECRET_KEY USB'); state.discovered.push('SECRET_KEY'); },
  },
  computer: {
    stage: 'computer',
    text: [
      '화면에 메시지가 표시됩니다:',
      '"REzeBlog에 오신 것을 환영합니다"',
      '"블로그 게시글을 읽으며 이야기를 발견하세요"',
    ],
    choices: [
      { label: 'USB를 꽂는다', emoji: '💾', nextStage: 'usb-insert', condition: (s) => s.inventory.includes('SECRET_KEY USB') },
      { label: '터미널을 연다', emoji: '⌨️', nextStage: 'terminal' },
      { label: '블로그로 돌아간다', emoji: '📖', nextStage: 'intro' },
    ],
    turn: 3,
  },
  'usb-insert': {
    stage: 'usb-insert',
    text: ['USB를 꽂자 화면이 바뀝니다.', '"관리자 모드 접근 허용"', '"숨겨진 게시글을 확인하세요"'],
    choices: [
      { label: '숨겨진 게시글 확인', emoji: '🔓', nextStage: 'secret-posts' },
      { label: '로그아웃', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 4,
    onEnter: (state) => { state.flags['admin_mode'] = true; state.discovered.push('관리자 모드'); },
  },
  terminal: {
    stage: 'terminal',
    text: ['터미널이 열립니다.', '> _', '명령어를 입력하세요:'],
    choices: [
      { label: 'help', emoji: '❓', nextStage: 'terminal-help' },
      { label: 'ls -la', emoji: '📂', nextStage: 'terminal-ls' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 4,
  },
  'terminal-help': {
    stage: 'terminal-help',
    text: ['사용 가능한 명령어:', '- help: 도움말', '- ls: 파일 목록', '- cat: 파일 내용 보기', '- exit: 종료'],
    choices: [
      { label: 'ls 입력', emoji: '📂', nextStage: 'terminal-ls' },
      { label: 'exit 입력', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
  },
  'terminal-ls': {
    stage: 'terminal-ls',
    text: ['drwxr-xr-x  posts/', '-rw-r--r--  secret.txt', '-rw-r--r--  readme.md'],
    choices: [
      { label: 'cat secret.txt', emoji: '🔐', nextStage: 'terminal-secret' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
  },
  'terminal-secret': {
    stage: 'terminal-secret',
    text: ['"비밀번호: REzeBlog2026"', '"이 비밀번호는 어딘가에서 사용됩니다..."'],
    choices: [
      { label: '비밀번호를 기록한다', emoji: '📝', nextStage: 'computer' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
    onEnter: (state) => { state.flags['know_password'] = true; state.discovered.push('비밀번호'); },
  },
  'secret-posts': {
    stage: 'secret-posts',
    text: ['숨겨진 게시글 목록:', '1. [완전한 진실]', '2. [시스템의 끝]', '3. [돌아가기]'],
    choices: [
      { label: '완전한 진실 읽기', emoji: '📜', nextStage: 'truth-ending' },
      { label: '시스템의 끝 읽기', emoji: '🔚', nextStage: 'system-ending' },
      { label: '돌아가기', emoji: '⬅️', nextStage: 'computer' },
    ],
    turn: 5,
  },
  'truth-ending': {
    stage: 'truth-ending',
    text: [
      '"당신은 이제 모든 것을 알게 되었습니다."',
      '"REzeBlog는 단순한 블로그가 아닙니다."',
      '"당신의 선택이 이야기를 만들어갑니다."',
      '',
      '🎉 [진실의 엔딩 달성]',
      '발견한 것들:',
    ],
    choices: [
      { label: '처음부터 다시', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 6,
    onEnter: (state) => { state.flags['true_ending'] = true; state.health = 100; state.sanity = 100; },
  },
  'system-ending': {
    stage: 'system-ending',
    text: [
      '"시스템을 종료합니다..."',
      '"당신은 이 시뮬레이션의 일부였습니다."',
      '"이제 깨어날 시간입니다."',
      '',
      '⚠️ [시스템 종료 엔딩 달성]',
    ],
    choices: [
      { label: '시스템 재부팅', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 6,
    onEnter: (state) => { state.flags['system_ending'] = true; state.health = 50; state.sanity = 0; },
  },
  look: {
    stage: 'look',
    text: ['벽에 포스트잇이 붙어있습니다.', '"Next.js 14 + PostgreSQL"', '"SEO 최적화 필수"', '개발 메모인 것 같습니다.'],
    choices: [
      { label: '컴퓨터로 돌아간다', emoji: '💻', nextStage: 'computer' },
      { label: '처음부터', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 3,
    onEnter: (state) => { state.discovered.push('개발 메모'); },
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
