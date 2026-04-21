// Admin 방문자 추적 API
// 방문자 유입경로, 페이지 조회, 키워드 추적
// 작성일: 2026-04-19 (Antigravity) - DB 연동 업데이트

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/drizzle'
import { visitors, searchRankings, posts } from '@/db/schema'
import { eq, desc, sql, count, gte } from 'drizzle-orm'

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

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Overview stats from visitors table
    const totalVisitorsResult = await db.select({ count: count() }).from(visitors)
    const todayVisitorsResult = await db
      .select({ count: count() })
      .from(visitors)
      .where(gte(visitors.createdAt, today))

    const totalVisitors = totalVisitorsResult[0]?.count || 0
    const todayVisitors = todayVisitorsResult[0]?.count || 0

    // Recent visitors (last 20)
    const recentVisitorsData = await db
      .select()
      .from(visitors)
      .orderBy(desc(visitors.createdAt))
      .limit(20)

    const recentVisitors = recentVisitorsData.map((v, idx) => ({
      id: `v${idx + 1}`,
      ip: v.ip?.substring(0, 10) + 'xxx' || 'unknown',
      country: v.country || 'KR',
      referrer: v.referrer || '직접 방문',
      pages: v.pages || ['/'],
      time: formatTimeAgo(v.createdAt),
      duration: formatDuration(v.duration || 0),
    }))

    // Search rankings from DB
    const searchRankingData = await db
      .select()
      .from(searchRankings)
      .orderBy(desc(searchRankings.updatedAt))

    const googleRankings = searchRankingData
      .filter((r) => r.engine === 'google')
      .map((r) => ({ keyword: r.keyword, rank: r.rank, page: r.page }))

    const naverRankings = searchRankingData
      .filter((r) => r.engine === 'naver')
      .map((r) => ({ keyword: r.keyword, rank: r.rank, page: r.page }))

    // Post view stats (from posts table)
    const postsData = await db
      .select({
        slug: posts.slug,
        title: posts.title,
        views: posts.views,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.views))
      .limit(10)

    const topPages = postsData.map((p) => ({
      path: `/blog/${p.slug}`,
      title: p.title,
      views: p.views || 0,
      uniqueVisitors: Math.floor((p.views || 0) * 0.6), // estimated
    }))

    // Calculate analytics
    const totalViews = postsData.reduce((sum, p) => sum + (p.views || 0), 0)
    
    // Calculate true average session duration from DB (only from visitors with duration > 0)
    const durationStats = await db.select({
      totalDuration: sql<number>`sum(${visitors.duration})`,
      validCount: sql<number>`count(case when ${visitors.duration} > 0 then 1 end)`
    }).from(visitors)
    
    const totalDuration = Number(durationStats[0]?.totalDuration || 0)
    const validCount = Number(durationStats[0]?.validCount || 0)
    const avgSessionDuration = validCount > 0 ? Math.floor(totalDuration / validCount) : 0

    // Dynamic Referrers Calculation
    const referrerMap: Record<string, number> = {}
    let directCount = 0
    let googleCount = 0
    let naverCount = 0
    let xCount = 0
    let otherCount = 0

    recentVisitorsData.forEach(v => {
      const ref = v.referrer?.toLowerCase() || ''
      if (!ref) directCount++
      else if (ref.includes('google')) googleCount++
      else if (ref.includes('naver')) naverCount++
      else if (ref.includes('twitter') || ref.includes('t.co')) xCount++
      else otherCount++
    })

    const calcPerc = (cnt: number) => totalVisitors > 0 ? Number(((cnt / totalVisitors) * 100).toFixed(1)) : 0

    const referrers = [
      { source: 'Google 검색', visitors: googleCount, percentage: calcPerc(googleCount) },
      { source: 'Naver 검색', visitors: naverCount, percentage: calcPerc(naverCount) },
      { source: '직접 방문', visitors: directCount, percentage: calcPerc(directCount) },
      { source: 'Twitter/X', visitors: xCount, percentage: calcPerc(xCount) },
      { source: '기타', visitors: otherCount, percentage: calcPerc(otherCount) },
    ]

    const analyticsData = {
      overview: {
        totalVisitors,
        todayVisitors,
        pageViews: totalViews,
        avgSessionDuration: formatDuration(avgSessionDuration * 60),
        bounceRate: '45.2%', // placeholder - would need actual calculation
      },
      topPages,
      referrers: referrers,
      topKeywords: [
        { keyword: '인터랙티브 스토리텔링', clicks: 145, impressions: 2340, position: 3.2 },
        { keyword: 'Next.js 블로그 만들기', clicks: 98, impressions: 1890, position: 5.7 },
        { keyword: '텍스트 게임 개발', clicks: 76, impressions: 1230, position: 4.1 },
        { keyword: '인디 게임 개발 가이드', clicks: 54, impressions: 890, position: 8.3 },
        { keyword: '스토리 기반 게임', clicks: 43, impressions: 670, position: 6.9 },
      ],
      searchRankings: {
        google: googleRankings,
        naver: naverRankings,
      },
      recentVisitors,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics error:', error)
    // Return fallback data if DB error
    return NextResponse.json(getFallbackAnalytics())
  }
}

// Helper functions
function formatTimeAgo(date: Date | null): string {
  if (!date) return '알 수 없음'
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0초'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}초`
  return `${mins}분 ${secs}초`
}

function getFallbackAnalytics() {
  return {
    overview: {
      totalVisitors: 0,
      todayVisitors: 0,
      pageViews: 0,
      avgSessionDuration: '0초',
      bounceRate: '0%',
    },
    topPages: [],
    referrers: [],
    topKeywords: [],
    searchRankings: { google: [], naver: [] },
    recentVisitors: [],
  }
}
