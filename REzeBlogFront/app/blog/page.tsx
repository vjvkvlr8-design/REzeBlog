// 블로그 목록 페이지
// 작성일: 2026-04-18

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '블로그 - 인터랙티브 스토리텔링과 1인 개발 이야기 | REzeBlog',
  description: '텍스트 기반 인터랙티브 스토리, Next.js 14 개발 팁, 1인 개발자를 위한 실전 가이드. Twine, Ink부터 PostgreSQL 연동까지.',
  keywords: ['블로그', '인터랙티브 스토리', '텍스트 게임', 'Next.js 14', '1인 개발', '스토리텔링'],
  openGraph: {
    title: 'REzeBlog - 인터랙티브 스토리텔링과 기술 이야기',
    description: '텍스트 기반 인터랙티브 스토리와 Next.js 개발 팁을 공유합니다.',
    type: 'website',
  },
}

// 블로그 게시글 데이터 (DB 연동 예정)
const posts = [
  {
    id: '1',
    slug: 'interactive-storytelling-guide',
    title: '인터랙티브 스토리텔링 완벽 가이드: 독자가 주인공이 되는 이야기',
    excerpt: '텍스트 기반 인터랙티브 스토리텔링의 모든 것. 독자의 선택으로 변하는 이야기를 만드는 방법과 Next.js로 구현하는 기술적 팁을 소개합니다.',
    category: '기술 튜토리얼',
    date: '2026-04-19',
    readTime: '8분',
  },
  {
    id: '2',
    slug: 'nextjs-fullstack-blog',
    title: 'Next.js 14로 1인 개발 블로그 만들기: 풀스택 가이드',
    excerpt: '1인 개발자를 위한 Next.js 14 풀스택 블로그 만들기. App Router, Server Components, PostgreSQL 연동까지 실전 팁을 소개합니다.',
    category: '개발 일지',
    date: '2026-04-19',
    readTime: '12분',
  },
  {
    id: '3',
    slug: 'text-game-development',
    title: '텍스트 게임 개발 입문: 코드 없이 시작하는 방법',
    excerpt: '프로그래밍 없이 텍스트 기반 게임을 만드는 방법. Twine, Ink, 그리고 Next.js로 진화하는 단계별 가이드. 인터랙티브 픽션 개발의 시작점입니다.',
    category: '기술 튜토리얼',
    date: '2026-04-19',
    readTime: '10분',
  },
  {
    id: '4',
    slug: 'indie-game-development-guide',
    title: '인디 게임 개발 완벽 가이드: 1인 개발자의 성공 전략',
    excerpt: '1인 인디 게임 개발자를 위한 실전 가이드. 기획부터 출시까지, 텍스트 게임부터 시작하는 저비용 고효율 개발 전략을 소개합니다.',
    category: '개발 일지',
    date: '2026-04-19',
    readTime: '15분',
  },
  {
    id: '5',
    slug: 'story-based-games-guide',
    title: '스토리 기반 게임 제작: 플레이어를 사로잡는 서사 설계',
    excerpt: '스토리 기반 게임의 핵심 원칙. 캐릭터, 플롯, 세계관을 설계하는 방법과 플레이어의 몰입을 극대화하는 기술적 팁을 소개합니다.',
    category: '기술 튜토리얼',
    date: '2026-04-19',
    readTime: '11분',
  },
  {
    id: '6',
    slug: 'darkness-story',
    title: '어둠 속에서 시작하는 이야기',
    excerpt: 'REzeBlog의 첫 번째 인터랙티브 스토리. 당신의 선택이 세상을 바꿉니다.',
    category: '인터랙티브 스토리',
    date: '2026-04-18',
    readTime: '10분',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-discord-1000 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <Link 
            href="/" 
            className="text-discord-400 hover:text-discord-100 transition-colors mb-4 inline-block"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-discord-100">
            블로그
          </h1>
          <p className="text-discord-400 mt-2">
            인터랙티브 스토리텔링과 기술 이야기
          </p>
        </header>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article 
              key={post.id}
              className="discord-card p-6 hover:bg-discord-900 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-discord-brand mb-2">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime} 읽기</span>
              </div>
              
              <h2 className="text-xl font-semibold text-discord-100 mb-2">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="hover:text-discord-brand transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              
              <p className="text-discord-400">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="discord-card p-12 text-center">
            <p className="text-discord-400">
              아직 게시글이 없습니다.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
