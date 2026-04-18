// 블로그 목록 페이지
// 작성일: 2026-04-18

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '블로그 - REzeBlog',
  description: '인터랙티브 스토리텔링과 기술 이야기',
}

// 더미 데이터 (실제로는 DB에서 조회)
const posts = [
  {
    id: '1',
    slug: 'darkness-story',
    title: '어둠 속에서 시작하는 이야기',
    excerpt: 'REzeBlog의 첫 번째 인터랙티브 스토리. 당신의 선택이 세상을 바꿉니다.',
    category: '인터랙티브 스토리',
    date: '2026-04-18',
    readTime: '10분',
  }
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
