import Link from 'next/link'

export const metadata = {
  title: '페이지를 찾을 수 없습니다 - REzeBlog',
  description: '요청하신 페이지가 존재하지 않습니다. 다른 콘텐츠를 탐색해보세요.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#5865F2] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-[#B9BBBE] mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-[#5865F2] text-white px-6 py-3 rounded-lg hover:bg-[#4752C4] transition-colors"
          >
            메인 페이지로 이동
          </Link>
          <div className="block">
            <Link
              href="/game"
              className="text-[#00AFF4] hover:underline"
            >
              인터랙티브 스토리 체험하기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
