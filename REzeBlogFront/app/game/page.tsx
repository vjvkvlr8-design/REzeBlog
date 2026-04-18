import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '텍스트 어드벤처 - 어둠 속에서 시작',
  description: '당신의 선택이 이야기를 바꾸는 인터랙티브 텍스트 게임',
}

export default function GamePage() {
  return (
    <main className="min-h-screen bg-discord-1000 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link 
            href="/" 
            className="text-discord-400 hover:text-discord-100 transition-colors mb-4 inline-block"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-discord-100">
            텍스트 어드벤처
          </h1>
          <p className="text-discord-400 mt-2">
            당신의 선택이 이야기를 바꿉니다
          </p>
        </header>

        {/* Game Container */}
        <div className="discord-card p-8">
          {/* Game Text */}
          <div className="game-text text-discord-100 mb-8 space-y-4">
            <p className="animate-fade-in">
              주변은 온통 어둠입니다.
            </p>
            <p className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              아무것도 보이지 않습니다. 마치 눈을 감은 것처럼...
            </p>
            <p className="animate-fade-in" style={{ animationDelay: '1s' }}>
              하지만 이것은 눈을 뜨고 있는 상태입니다.
            </p>
            <p className="animate-fade-in text-discord-brand" style={{ animationDelay: '1.5s' }}>
              [턴 1 | 생산률: 0/초]
            </p>
          </div>

          {/* Progress Bar (Santa Inc. 스타일) */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-discord-400 mb-2">
              <span>진행도</span>
              <span>0%</span>
            </div>
            <div className="h-2 bg-discord-900 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-discord-brand transition-all duration-1000" />
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <h3 className="text-discord-300 text-sm uppercase tracking-wider mb-4">
              선택지
            </h3>
            
            <button className="choice-button group">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
                <div>
                  <p className="font-medium text-discord-100">불을 밝힌다</p>
                  <p className="text-sm text-discord-500">주변이 보이기 시작합니다</p>
                </div>
              </div>
            </button>

            <button className="choice-button group">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">⏳</span>
                <div>
                  <p className="font-medium text-discord-100">기다린다</p>
                  <p className="text-sm text-discord-500">무언가 변화가 있을지도...</p>
                </div>
              </div>
            </button>

            <button className="choice-button group opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❓</span>
                <div>
                  <p className="font-medium text-discord-500">???</p>
                  <p className="text-sm text-discord-600">아직 잠겨 있습니다</p>
                </div>
              </div>
            </button>
          </div>

          {/* Game Stats (Santa Inc. 참고) */}
          <div className="mt-8 pt-6 border-t border-discord-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="discord-card p-3">
                <p className="text-2xl font-mono text-discord-brand">0</p>
                <p className="text-xs text-discord-500">생산</p>
              </div>
              <div className="discord-card p-3">
                <p className="text-2xl font-mono text-discord-yellow">0</p>
                <p className="text-xs text-discord-500">고용</p>
              </div>
              <div className="discord-card p-3">
                <p className="text-2xl font-mono text-discord-green">1</p>
                <p className="text-xs text-discord-500">턴</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Metadata Preview (개발용) */}
        <div className="mt-8 p-4 bg-discord-1100 rounded-lg border border-discord-800">
          <h4 className="text-discord-400 text-sm mb-2">SEO 메타데이터 (개발용)</h4>
          <div className="space-y-1 text-xs text-discord-500">
            <p>Title: 텍스트 어드벤처 - 어둠 속에서 시작 | REzeBlog</p>
            <p>Description: 당신의 선택이 이야기를 바꾸는 인터랙티브 텍스트 게임</p>
            <p>Keywords: 텍스트 게임, 인터랙티브 스토리, 어드벤처</p>
          </div>
        </div>
      </div>
    </main>
  )
}
