import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'REzeBlog Dashboard - 게임 데이터 분석',
  description: '인터랙티브 스토리 게임 데이터 시각화 및 SEO 모니터링 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
