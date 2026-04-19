// Admin 방문자 추적 API
// 방문자 유입경로, 페이지 조회, 키워드 추적
// 작성일: 2026-04-19 (Antigravity)

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthenticated(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')
  if (!token) return false
  
  try {
    const decoded = Buffer.from(token.value, 'base64').toString()
    const [prefix, , pass] = decoded.split(':')
    return prefix === 'admin' && pass === process.env.ADMIN_PASSWORD
  } catch {
    return false
  }
}

// 방문자 추적 데이터 (실제로는 DB에 저장)
const analyticsData = {
  overview: {
    totalVisitors: 1247,
    todayVisitors: 83,
    pageViews: 3891,
    avgSessionDuration: '2분 34초',
    bounceRate: '34.2%',
  },
  topPages: [
    { path: '/blog/interactive-storytelling-guide', title: '인터랙티브 스토리텔링 가이드', views: 892, uniqueVisitors: 456 },
    { path: '/blog/nextjs-fullstack-blog', title: 'Next.js 풀스택 가이드', views: 634, uniqueVisitors: 321 },
    { path: '/blog/text-game-development', title: '텍스트 게임 개발 입문', views: 445, uniqueVisitors: 234 },
    { path: '/', title: '메인 (#환영합니다)', views: 1203, uniqueVisitors: 987 },
    { path: '/blog', title: '블로그 (#일반)', views: 717, uniqueVisitors: 523 },
  ],
  referrers: [
    { source: 'Google 검색', visitors: 523, percentage: 41.9 },
    { source: 'Naver 검색', visitors: 312, percentage: 25.0 },
    { source: '직접 방문', visitors: 198, percentage: 15.9 },
    { source: 'Twitter/X', visitors: 87, percentage: 7.0 },
    { source: '기타', visitors: 127, percentage: 10.2 },
  ],
  topKeywords: [
    { keyword: '인터랙티브 스토리텔링', clicks: 145, impressions: 2340, position: 3.2 },
    { keyword: 'Next.js 블로그 만들기', clicks: 98, impressions: 1890, position: 5.7 },
    { keyword: '텍스트 게임 개발', clicks: 76, impressions: 1230, position: 4.1 },
    { keyword: '인디 게임 개발 가이드', clicks: 54, impressions: 890, position: 8.3 },
    { keyword: '스토리 기반 게임', clicks: 43, impressions: 670, position: 6.9 },
  ],
  searchRankings: {
    google: [
      { keyword: '인터랙티브 스토리텔링', rank: 3, page: '/blog/interactive-storytelling-guide' },
      { keyword: '텍스트 게임 개발', rank: 4, page: '/blog/text-game-development' },
      { keyword: 'Next.js 블로그 만들기', rank: 6, page: '/blog/nextjs-fullstack-blog' },
      { keyword: '인디 게임 개발', rank: 8, page: '/blog/indie-game-development-guide' },
    ],
    naver: [
      { keyword: '인터랙티브 스토리텔링', rank: 5, page: '/blog/interactive-storytelling-guide' },
      { keyword: '텍스트 게임 만들기', rank: 7, page: '/blog/text-game-development' },
      { keyword: 'Next.js 블로그', rank: 12, page: '/blog/nextjs-fullstack-blog' },
    ],
  },
  recentVisitors: [
    { id: 'v1', ip: '125.xxx.xxx.42', country: 'KR', referrer: 'Google: "인터랙티브 스토리텔링"', pages: ['/', '/blog', '/blog/interactive-storytelling-guide'], time: '2분 전', duration: '3분 12초' },
    { id: 'v2', ip: '211.xxx.xxx.88', country: 'KR', referrer: 'Naver: "텍스트 게임 개발"', pages: ['/blog/text-game-development'], time: '5분 전', duration: '1분 43초' },
    { id: 'v3', ip: '58.xxx.xxx.15', country: 'KR', referrer: '직접 방문', pages: ['/', '/blog'], time: '12분 전', duration: '45초' },
    { id: 'v4', ip: '112.xxx.xxx.67', country: 'KR', referrer: 'Twitter', pages: ['/blog/nextjs-fullstack-blog'], time: '18분 전', duration: '5분 02초' },
    { id: 'v5', ip: '203.xxx.xxx.91', country: 'JP', referrer: 'Google: "interactive storytelling blog"', pages: ['/', '/blog/interactive-storytelling-guide', '/blog/story-based-games-guide'], time: '25분 전', duration: '7분 34초' },
  ],
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json(analyticsData)
}
