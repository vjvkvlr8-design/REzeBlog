import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GameProgress {
  currentStage: string
  turn: number
  inventory: string[]
  health: number
  sanity: number
  discovered: string[]
  flags: Record<string, boolean>
}

export interface GameChoice {
  label: string
  emoji: string
  nextStage: string
  disabled?: boolean
  condition?: (state: GameProgress) => boolean
}

export interface GameState {
  stage: string
  text: string[]
  choices: GameChoice[]
  turn: number
  onEnter?: (state: GameProgress) => void
}

export interface SaveSlot {
  slot: number
  name: string
  stage: string
  turn: number
  savedAt: string
  progress: GameProgress
}

const INITIAL_PROGRESS: GameProgress = {
  currentStage: 'intro',
  turn: 1,
  inventory: [],
  health: 100,
  sanity: 100,
  discovered: [],
  flags: {},
}

// 15개 스테이지 하드코딩 데이터
const gameData: Record<string, GameState> = {
  intro: {
    stage: 'intro',
    text: [
      '🔮 **REzeBlog 텍스트 어드벤처**',
      '',
      '주변은 온통 어둠입니다. 아무것도 보이지 않습니다...',
      '손에 무언가 작은 물건이 들려 있습니다.',
      '',
      '*어둠 속에서 당신의 선택이 이야기를 만들어갑니다*',
    ],
    choices: [
      { label: '불을 밝힌다', emoji: '🔥', nextStage: 'light' },
      { label: '기다린다', emoji: '⏳', nextStage: 'wait' },
      { label: '물건을 확인한다', emoji: '🎒', nextStage: 'check-item' },
    ],
    turn: 1,
  },
  'check-item': {
    stage: 'check-item',
    text: [
      '🎒 **인벤토리 확인**',
      '',
      '손에는 작은 라이터가 들려 있습니다.',
      '"이 라이터... 어디선가 본 것 같습니다."',
      '',
      '✅ **라이터를 얻었습니다!**',
    ],
    choices: [
      { label: '라이터로 불을 밝힌다', emoji: '🔥', nextStage: 'light' },
      { label: '어둠 속에서 기다린다', emoji: '⏳', nextStage: 'wait' },
    ],
    turn: 1,
    onEnter: (state) => {
      if (!state.inventory.includes('라이터')) {
        state.inventory.push('라이터')
      }
      if (!state.discovered.includes('라이터')) {
        state.discovered.push('라이터')
      }
    },
  },
  light: {
    stage: 'light',
    text: [
      '🔥 **불빛 속에서**',
      '',
      '불빛이 주변을 비춥니다.',
      '오래된 책상과 컴퓨터가 보입니다.',
      '화면에 무언가 깜빡이고 있습니다...',
      '',
      '*코딩 중인 개발자의 방 같은 느낌이 듭니다*',
    ],
    choices: [
      { label: '컴퓨터를 확인한다', emoji: '💻', nextStage: 'computer' },
      { label: '주변을 더 살핀다', emoji: '👀', nextStage: 'look' },
      { label: '책상 서랍을 연다', emoji: '🗄️', nextStage: 'drawer' },
    ],
    turn: 2,
  },
  wait: {
    stage: 'wait',
    text: [
      '⏳ **어둠 속에서**',
      '',
      '어둠 속에서 기다립니다...',
      '"삐-" 어디선가 소리가 들립니다.',
      '기계음이 점점 가까워집니다.',
      '',
      '*정신력이 조금씩 감소합니다...*',
    ],
    choices: [
      { label: '소리를 따라간다', emoji: '👂', nextStage: 'computer' },
      { label: '가만히 있는다', emoji: '🧘', nextStage: 'intro' },
      { label: '라이터를 켠다', emoji: '🔥', nextStage: 'light', condition: (s) => s.inventory.includes('라이터') },
    ],
    turn: 2,
    onEnter: (state) => {
      state.sanity = Math.max(0, state.sanity - 5)
    },
  },
  drawer: {
    stage: 'drawer',
    text: [
      '🗄️ **서랍 속 발견**',
      '',
      '서랍 안에서 낡은 USB를 발견했습니다.',
      'USB에는 "SECRET_KEY"라고 적혀 있습니다.',
      '',
      '✅ **SECRET_KEY USB를 얻었습니다!**',
    ],
    choices: [
      { label: 'USB를 챙긴다', emoji: '💾', nextStage: 'light' },
      { label: '무시하고 컴퓨터로 간다', emoji: '💻', nextStage: 'computer' },
    ],
    turn: 2,
    onEnter: (state) => {
      if (!state.inventory.includes('SECRET_KEY USB')) {
        state.inventory.push('SECRET_KEY USB')
      }
      if (!state.discovered.includes('SECRET_KEY')) {
        state.discovered.push('SECRET_KEY')
      }
    },
  },
  look: {
    stage: 'look',
    text: [
      '👀 **주변 살피기**',
      '',
      '벽에 포스트잇이 붙어있습니다.',
      '"Next.js 14 + PostgreSQL"',
      '"SEO 최적화 필수"',
      '"Discord UI 클론 진행중"',
      '',
      '*개발 메모인 것 같습니다*',
    ],
    choices: [
      { label: '컴퓨터로 돌아간다', emoji: '💻', nextStage: 'computer' },
      { label: '처음부터', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 3,
    onEnter: (state) => {
      if (!state.discovered.includes('개발 메모')) {
        state.discovered.push('개발 메모')
      }
    },
  },
  computer: {
    stage: 'computer',
    text: [
      '💻 **컴퓨터 화면**',
      '',
      '화면에 메시지가 표시됩니다:',
      '',
      '> "REzeBlog에 오신 것을 환영합니다"',
      '> "블로그 게시글을 읽으며 이야기를 발견하세요"',
      '',
      '*커서가 깜빡이고 있습니다*',
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
    text: [
      '💾 **관리자 모드 진입**',
      '',
      'USB를 꽂자 화면이 바뀝니다.',
      '',
      '> "관리자 모드 접근 허용"',
      '> "숨겨진 게시글을 확인하세요"',
      '',
      '🔓 **비밀 영역이 열렸습니다!**',
    ],
    choices: [
      { label: '숨겨진 게시글 확인', emoji: '🔓', nextStage: 'secret-posts' },
      { label: '로그아웃', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 4,
    onEnter: (state) => {
      state.flags['admin_mode'] = true
      if (!state.discovered.includes('관리자 모드')) {
        state.discovered.push('관리자 모드')
      }
    },
  },
  terminal: {
    stage: 'terminal',
    text: [
      '⌨️ **터미널 모드**',
      '',
      '터미널이 열립니다.',
      '> _',
      '',
      '명령어를 입력하세요:',
    ],
    choices: [
      { label: 'help', emoji: '❓', nextStage: 'terminal-help' },
      { label: 'ls -la', emoji: '📂', nextStage: 'terminal-ls' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 4,
  },
  'terminal-help': {
    stage: 'terminal-help',
    text: [
      '❓ **도움말**',
      '',
      '사용 가능한 명령어:',
      '- help: 도움말',
      '- ls: 파일 목록',
      '- cat: 파일 내용 보기',
      '- exit: 종료',
    ],
    choices: [
      { label: 'ls 입력', emoji: '📂', nextStage: 'terminal-ls' },
      { label: 'exit 입력', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
  },
  'terminal-ls': {
    stage: 'terminal-ls',
    text: [
      '📂 **파일 목록**',
      '',
      'drwxr-xr-x  posts/',
      '-rw-r--r--  secret.txt',
      '-rw-r--r--  readme.md',
      '',
      '*secret.txt가 수상해 보입니다...*',
    ],
    choices: [
      { label: 'cat secret.txt', emoji: '🔐', nextStage: 'terminal-secret' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
  },
  'terminal-secret': {
    stage: 'terminal-secret',
    text: [
      '🔐 **비밀 파일 발견**',
      '',
      '"비밀번호: [데이터 손상됨: 알 수 없음]"',
      '"이 비밀번호는 어딘가에서 사용됩니다..."',
      '',
      '✅ **단서를 기록했습니다!**',
    ],
    choices: [
      { label: '단서를 기록한다', emoji: '📝', nextStage: 'secret-room' },
      { label: 'exit', emoji: '🚪', nextStage: 'computer' },
    ],
    turn: 5,
    onEnter: (state) => {
      state.flags['know_password'] = true
      if (!state.discovered.includes('비밀번호')) {
        state.discovered.push('비밀번호')
      }
    },
  },
  'secret-room': {
    stage: 'secret-room',
    text: [
      '🔮 **비밀의 방**',
      '',
      '비밀번호를 입력하자 벽이 열립니다.',
      '숨겨진 방이 나타납니다.',
      '방 안에는 낡은 서버와 수상한 노트북이 있습니다.',
      '',
      '*이상한 기운이 느껴집니다...*',
    ],
    choices: [
      { label: '서버를 조사한다', emoji: '🖥️', nextStage: 'secret-posts' },
      { label: '노트북을 연다', emoji: '💻', nextStage: 'computer' },
      { label: '돌아간다', emoji: '⬅️', nextStage: 'computer' },
    ],
    turn: 6,
    onEnter: (state) => {
      if (!state.discovered.includes('비밀 방')) {
        state.discovered.push('비밀 방')
      }
      state.sanity = Math.max(0, state.sanity - 10)
    },
  },
  'secret-posts': {
    stage: 'secret-posts',
    text: [
      '📜 **숨겨진 게시글 목록**',
      '',
      '1. [완전한 진실]',
      '2. [시스템의 끝]',
      '3. [돌아가기]',
      '',
      '*당신의 선택이 결말을 결정합니다*',
    ],
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
      '🎉 **진실의 엔딩**',
      '',
      '"당신은 이제 모든 것을 알게 되었습니다."',
      '"REzeBlog는 단순한 블로그가 아닙니다."',
      '"당신의 선택이 이야기를 만들어갑니다."',
      '',
      '🏆 **진실의 엔딩 달성!**',
      '',
      '*이제 이 이야기를 세상과 공유할 수 있습니다*',
    ],
    choices: [
      { label: '처음부터 다시', emoji: '🔄', nextStage: 'intro' },
      { label: '엔딩 공유하기', emoji: '📤', nextStage: 'share-ending' },
    ],
    turn: 6,
    onEnter: (state) => {
      state.flags['true_ending'] = true
      state.health = 100
      state.sanity = 100
    },
  },
  'system-ending': {
    stage: 'system-ending',
    text: [
      '⚠️ **시스템 종료 엔딩**',
      '',
      '"시스템을 종료합니다..."',
      '"당신은 이 시뮬레이션의 일부였습니다."',
      '"이제 깨어날 시간입니다."',
      '',
      '☠️ **시스템 종료 엔딩 달성**',
      '',
      '*모든 것이 재설정됩니다*',
    ],
    choices: [
      { label: '시스템 재부팅', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 6,
    onEnter: (state) => {
      state.flags['system_ending'] = true
      state.health = 50
      state.sanity = 0
    },
  },
  'share-ending': {
    stage: 'share-ending',
    text: [
      '📤 **엔딩 공유하기**',
      '',
      '당신의 여정을 기록으로 남깁니다.',
      '이 이야기는 블로그 게시글로 공유될 수 있습니다.',
      '',
      '🎮 플레이 통계:',
    ],
    choices: [
      { label: '새 게임 시작', emoji: '🔄', nextStage: 'intro' },
    ],
    turn: 6,
  },
}

interface GameStore {
  progress: GameProgress
  saveSlots: SaveSlot[]
  isOpen: boolean
  isMinimized: boolean
  showInventory: boolean
  showSaveMenu: boolean
  currentGame: GameState
  
  // Actions
  setIsOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  setShowInventory: (show: boolean) => void
  setShowSaveMenu: (show: boolean) => void
  makeChoice: (choice: GameChoice) => void
  resetGame: () => void
  saveGame: (slot: number, name?: string) => void
  loadGame: (slot: number) => void
  getShareableContent: () => { title: string; content: string; ending: string }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      progress: { ...INITIAL_PROGRESS },
      saveSlots: [],
      isOpen: false,
      isMinimized: false,
      showInventory: false,
      showSaveMenu: false,
      currentGame: gameData.intro,

      setIsOpen: (open) => set({ isOpen: open }),
      setIsMinimized: (minimized) => set({ isMinimized: minimized }),
      setShowInventory: (show) => set({ showInventory: show }),
      setShowSaveMenu: (show) => set({ showSaveMenu: show }),

      makeChoice: (choice) => {
        const { progress } = get()
        const nextGame = gameData[choice.nextStage]
        
        if (!nextGame) return

        // Create new progress
        const newProgress = { 
          ...progress, 
          currentStage: choice.nextStage, 
          turn: nextGame.turn 
        }

        // Execute onEnter callback
        if (nextGame.onEnter) {
          nextGame.onEnter(newProgress)
        }

        set({ 
          progress: newProgress,
          currentGame: nextGame,
        })

        // Auto-save on stage change (except intro)
        if (choice.nextStage !== 'intro') {
          const { saveSlots } = get()
          const autoSave: SaveSlot = {
            slot: 0,
            name: '자동 저장',
            stage: choice.nextStage,
            turn: newProgress.turn,
            savedAt: new Date().toISOString(),
            progress: newProgress,
          }
          set({ 
            saveSlots: [...saveSlots.filter(s => s.slot !== 0), autoSave].sort((a, b) => a.slot - b.slot)
          })
        }
      },

      resetGame: () => {
        set({ 
          progress: { ...INITIAL_PROGRESS },
          currentGame: gameData.intro,
        })
      },

      saveGame: (slot, name) => {
        const { progress, saveSlots } = get()
        const newSave: SaveSlot = {
          slot,
          name: name || `저장 ${slot} (턴 ${progress.turn})`,
          stage: progress.currentStage,
          turn: progress.turn,
          savedAt: new Date().toISOString(),
          progress: { ...progress },
        }
        set({
          saveSlots: [...saveSlots.filter(s => s.slot !== slot), newSave].sort((a, b) => a.slot - b.slot),
        })
      },

      loadGame: (slot) => {
        const { saveSlots } = get()
        const save = saveSlots.find(s => s.slot === slot)
        if (save && gameData[save.stage]) {
          set({
            progress: save.progress,
            currentGame: gameData[save.stage],
            showSaveMenu: false,
          })
        }
      },

      getShareableContent: () => {
        const { progress } = get()
        const ending = progress.flags['true_ending'] ? '진실의 엔딩' 
          : progress.flags['system_ending'] ? '시스템 종료 엔딩'
          : '미완료'
        
        const title = `[REzeBlog 게임] ${ending} 달성!`
        
        const content = `
## 🎮 REzeBlog 텍스트 어드벤처 플레이 기록

**달성 엔딩:** ${ending}

**플레이 통계:**
- 턴: ${progress.turn}
- 체력: ${progress.health}/100
- 정신: ${progress.sanity}/100

**발견한 것들:**
${progress.discovered.map(d => `- ${d}`).join('\n') || '- 없음'}

**인벤토리:**
${progress.inventory.map(i => `- ${i}`).join('\n') || '- 없음'}

---
*이 기록은 REzeBlog 텍스트 게임에서 자동 생성되었습니다.*
        `.trim()

        return { title, content, ending }
      },
    }),
    {
      name: 'rezeblog-game-storage',
      partialize: (state) => ({ 
        progress: state.progress, 
        saveSlots: state.saveSlots 
      }),
    }
  )
)

export { gameData, INITIAL_PROGRESS }
