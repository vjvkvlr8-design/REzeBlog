// Google Search Console API - 실제 검색 데이터 조회
// 서비스 계정 인증으로 자동 데이터 수집

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAccessToken } from '@/lib/google-auth'

const SEARCH_CONSOLE_PROPERTY = process.env.SEARCH_CONSOLE_PROPERTY || 'https://rezeblog.vercel.app/'

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

// Search Console API 데이터 타입
interface SearchAnalyticsQuery {
  startDate: string
  endDate: string
  dimensions?: string[]
  rowLimit?: number
  startRow?: number
}

interface SearchAnalyticsRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

// 검색 데이터 가져오기
async function fetchSearchAnalytics(accessToken: string, query: SearchAnalyticsQuery): Promise<SearchAnalyticsRow[] | null> {
  try {
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEARCH_CONSOLE_PROPERTY)}/searchAnalytics/query`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Search Console API error:', error)
      return null
    }

    const data = await response.json()
    return data.rows || []
  } catch (error) {
    console.error('Failed to fetch search analytics:', error)
    return null
  }
}

// 사이트 정보 가져오기
async function fetchSiteInfo(accessToken: string): Promise<any | null> {
  try {
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEARCH_CONSOLE_PROPERTY)}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Site info fetch failed')
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch site info:', error)
    return null
  }
}

export async function GET() {
  // Admin 인증 체크
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Google Service Account 인증
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google authentication failed. Check GOOGLE_SERVICE_ACCOUNT_KEY_BASE64.' },
      { status: 500 }
    )
  }

  // 날짜 계산 (최근 28일)
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // 병렬로 여러 데이터 요청
  const [
    siteInfo,
    queryData,     // 검색 키워드별 데이터
    pageData,      // 페이지별 데이터
    dailyData,     // 날짜별 데이터 (트렌드)
  ] = await Promise.all([
    fetchSiteInfo(accessToken),
    fetchSearchAnalytics(accessToken, {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 10,
    }),
    fetchSearchAnalytics(accessToken, {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 10,
    }),
    fetchSearchAnalytics(accessToken, {
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 28,
    }),
  ])

  // 데이터 집계
  const totalClicks = queryData?.reduce((sum, row) => sum + row.clicks, 0) || 0
  const totalImpressions = queryData?.reduce((sum, row) => sum + row.impressions, 0) || 0
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgPosition = (queryData && queryData.length > 0) 
    ? queryData.reduce((sum, row) => sum + row.position, 0) / queryData.length 
    : 0

  // 키워드 데이터 포맷
  const topKeywords = queryData?.map(row => ({
    keyword: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: parseFloat((row.ctr * 100).toFixed(2)),
    position: parseFloat(row.position.toFixed(1)),
  })) || []

  // 페이지 데이터 포맷
  const topPages = pageData?.map(row => ({
    path: row.keys[0].replace(SEARCH_CONSOLE_PROPERTY, '/'),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: parseFloat((row.ctr * 100).toFixed(2)),
    position: parseFloat(row.position.toFixed(1)),
  })) || []

  // 날짜별 트렌드 데이터
  const trendData = dailyData?.map(row => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
  })).sort((a, b) => a.date.localeCompare(b.date)) || []

  const response = {
    overview: {
      totalClicks,
      totalImpressions,
      avgCtr: parseFloat(avgCtr.toFixed(2)),
      avgPosition: parseFloat(avgPosition.toFixed(1)),
      period: `${startDate} ~ ${endDate}`,
    },
    topKeywords,
    topPages,
    trend: trendData,
    siteInfo: {
      url: siteInfo?.siteUrl,
      permission: siteInfo?.permissionLevel,
    },
  }

  return NextResponse.json(response)
}
