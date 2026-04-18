import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'REzeBlog - 인터랙티브 스토리텔링 블로그',
  description: '텍스트 기반 인터랙티브 스토리와 SEO 최적화가 결합된 새로운 블로그 경험',
}

export default function Home() {
  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-discord-brand text-white px-4 py-2 rounded-lg font-medium"
      >
        메인 콘텐츠로 건너뛰기
      </a>
      
      <main id="main-content" className="min-h-screen bg-discord-1000" role="main" aria-label="REzeBlog 메인 페이지">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold text-discord-100 mb-6 animate-fade-in">
            REzeBlog
          </h1>
          <p className="text-xl md:text-2xl text-discord-300 mb-4">
            인터랙티브 스토리텔링 블로그
          </p>
          <p className="text-discord-400 max-w-2xl mx-auto mb-8">
            텍스트 기반 게임과 블로그의 만낀.
            당신의 선택이 이야기를 바꿉니다.
            SEO 최적화로 더 많은 독자에게 다가갑니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/game" 
              className="discord-button text-lg py-3 px-8 focus:outline-none focus:ring-2 focus:ring-discord-brand focus:ring-offset-2"
              aria-label="인터랙티브 텍스트 게임 시작하기"
            >
              <span aria-hidden="true">🎮 </span>게임 시작하기
            </Link>
            <Link 
              href="/blog" 
              className="discord-button-secondary text-lg py-3 px-8 focus:outline-none focus:ring-2 focus:ring-discord-400 focus:ring-offset-2"
              aria-label="블로그 둘러보기"
            >
              <span aria-hidden="true">📖 </span>블로그 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-discord-1100" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-bold text-center text-discord-100 mb-12">
            특징
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <article className="discord-card p-6" aria-labelledby="feature-game">
              <div className="text-4xl mb-4" aria-hidden="true">🎮</div>
              <h3 id="feature-game" className="text-xl font-semibold text-discord-100 mb-2">
                텍스트 기반 게임
              </h3>
              <p className="text-discord-400">
                선택지를 통해 진행되는 인터랙티브 스토리.
                당신의 결정이 엔딩을 바꿉니다.
              </p>
            </article>
            
            <article className="discord-card p-6" aria-labelledby="feature-seo">
              <div className="text-4xl mb-4" aria-hidden="true">🔍</div>
              <h3 id="feature-seo" className="text-xl font-semibold text-discord-100 mb-2">
                SEO 최적화
              </h3>
              <p className="text-discord-400">
                Next.js 14 App Router와 SSR로
                검색엔진 상단 노출 극대화.
              </p>
            </article>
            
            <article className="discord-card p-6" aria-labelledby="feature-theme">
              <div className="text-4xl mb-4" aria-hidden="true">🎨</div>
              <h3 id="feature-theme" className="text-xl font-semibold text-discord-100 mb-2">
                디스코드 테마
              </h3>
              <p className="text-discord-400">
                익숙하고 편안한 다크 테마 UI.
                몰입감 있는 독서 경험.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="posts-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="posts-heading" className="text-3xl font-bold text-discord-100 mb-8">
            최근 게시글
          </h2>
          
          <div className="space-y-4" role="list">
            <article className="discord-card p-6 hover:bg-discord-900 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-discord-brand" role="listitem" tabIndex={0}>
              <h3 className="text-xl font-semibold text-discord-100 mb-2">
                어둠 속에서 시작하는 이야기
              </h3>
              <p className="text-discord-400 mb-4">
                REzeBlog의 첫 번째 인터랙티브 스토리.
                당신의 선택이 세상을 바꿉니다.
              </p>
              <div className="flex items-center gap-4 text-sm text-discord-500">
                <span>2026-04-18</span>
                <span>•</span>
                <span>인터랙티브 스토리</span>
                <span>•</span>
                <span>10분 읽기</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-discord-1100 border-t border-discord-800" role="contentinfo">
        <div className="max-w-6xl mx-auto text-center text-discord-500">
          <p>© 2026 REzeBlog. All rights reserved.</p>
        </div>
      </footer>
    </main>
    </>
  )
}
