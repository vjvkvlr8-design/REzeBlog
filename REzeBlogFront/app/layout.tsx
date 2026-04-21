import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { VisitorTracker } from '@/components/visitor-tracker'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'REzeBlog - 인터랙티브 스토리텔링 블로그',
    template: '%s | REzeBlog',
  },
  description: '텍스트 기반 인터랙티브 스토리와 SEO 최적화가 결합된 새로운 블로그 경험',
  keywords: ['블로그', '인터랙티브 스토리', '텍스트 게임', 'SEO'],
  authors: [{ name: 'REzeBlog' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'REzeBlog',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '4GXDslhA2uKCccM5d6-lL-VtacC2vAki2nEhh7F1A3E',
  },
}

export const viewport: Viewport = {
  themeColor: '#36393f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body>
        {children}
        {/* Visitor tracking */}
        <VisitorTracker />
      </body>
    </html>
  )
}
