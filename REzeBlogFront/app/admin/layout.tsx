// Admin Layout - 독립적인 레이아웃 (Discord UI와 분리)
// 절대 일반 사용자에게 노출되지 않음
// 작성일: 2026-04-19 (Antigravity)

import '../globals.css'

export const metadata = {
  title: 'Admin Panel | REzeBlog',
  robots: { index: false, follow: false }, // 검색엔진 차단
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      {children}
    </div>
  )
}
