import Link from 'next/link'

export const metadata = {
  title: '채널을 찾을 수 없습니다 - REzeBlog',
  description: '요청하신 채널이 존재하지 않습니다.',
}

export default function NotFound() {
  return (
    <>
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name">알 수 없는 채널</span>
      </div>
      <div className="chat-messages" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 80, marginBottom: 8 }}>🔍</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 8 }}>
            채널을 찾을 수 없습니다
          </h1>
          <p style={{ color: 'var(--dc-header-secondary)', marginBottom: 24, fontSize: 14 }}>
            요청하신 채널이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                background: 'var(--dc-brand)', color: '#fff', border: 'none',
                padding: '10px 24px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500,
              }}
            >
              #환영합니다 로 이동
            </Link>
            <Link
              href="/blog"
              style={{
                color: 'var(--dc-text-link)', textDecoration: 'none', fontSize: 14, marginTop: 8,
              }}
            >
              블로그 채널 둘러보기 →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
