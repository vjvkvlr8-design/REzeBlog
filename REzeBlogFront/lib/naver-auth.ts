// Naver Search Advisor API 인증 유틸리티
// NAVER_API_KEY, NAVER_API_SECRET 환경변수에서 API 인증 정보 로드

export interface NaverApiCredentials {
  apiKey: string
  apiSecret: string
}

// 환경변수에서 Naver API 인증 정보 가져오기
export function getNaverCredentials(): NaverApiCredentials | null {
  const apiKey = process.env.NAVER_API_KEY
  const apiSecret = process.env.NAVER_API_SECRET

  if (!apiKey || !apiSecret) {
    console.error('NAVER_API_KEY or NAVER_API_SECRET not set')
    return null
  }

  return { apiKey, apiSecret }
}

// Naver Search Advisor API 기본 URL
const NAVER_API_BASE_URL = 'https://openapi.naver.com/v1/search-advisor'

// 사이트 정보 조회
export async function fetchNaverSiteInfo(
  siteUrl: string
): Promise<{ siteId: string; name: string; url: string } | null> {
  const credentials = getNaverCredentials()
  if (!credentials) return null

  try {
    const response = await fetch(`${NAVER_API_BASE_URL}/sites`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': credentials.apiKey,
        'X-Naver-Client-Secret': credentials.apiSecret,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Naver API site info failed:', error)
      return null
    }

    const data = await response.json()
    // Find site matching our URL
    const site = data.sites?.find(
      (s: { url: string }) => s.url === siteUrl || siteUrl.includes(s.url)
    )
    return site || null
  } catch (error) {
    console.error('Failed to fetch Naver site info:', error)
    return null
  }
}

// 검색 노출 현황 조회
export async function fetchNaverExposureStats(
  siteId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalExposures: number
  totalClicks: number
  avgPosition: number
  dailyStats: Array<{
    date: string
    exposures: number
    clicks: number
    position: number
  }>
} | null> {
  const credentials = getNaverCredentials()
  if (!credentials) return null

  try {
    const response = await fetch(
      `${NAVER_API_BASE_URL}/sites/${siteId}/stats?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'X-Naver-Client-Id': credentials.apiKey,
          'X-Naver-Client-Secret': credentials.apiSecret,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Naver API exposure stats failed:', error)
      return null
    }

    const data = await response.json()
    return {
      totalExposures: data.totalExposures || 0,
      totalClicks: data.totalClicks || 0,
      avgPosition: data.avgPosition || 0,
      dailyStats: data.dailyStats || [],
    }
  } catch (error) {
    console.error('Failed to fetch Naver exposure stats:', error)
    return null
  }
}

// 인기 검색어 조회
export async function fetchNaverTopKeywords(
  siteId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<
  Array<{
    keyword: string
    exposures: number
    clicks: number
    position: number
  }>
> {
  const credentials = getNaverCredentials()
  if (!credentials) return []

  try {
    const response = await fetch(
      `${NAVER_API_BASE_URL}/sites/${siteId}/keywords?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-Naver-Client-Id': credentials.apiKey,
          'X-Naver-Client-Secret': credentials.apiSecret,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Naver API keywords failed:', error)
      return []
    }

    const data = await response.json()
    return data.keywords || []
  } catch (error) {
    console.error('Failed to fetch Naver keywords:', error)
    return []
  }
}

// 인기 페이지 조회
export async function fetchNaverTopPages(
  siteId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<
  Array<{
    page: string
    exposures: number
    clicks: number
  }>
> {
  const credentials = getNaverCredentials()
  if (!credentials) return []

  try {
    const response = await fetch(
      `${NAVER_API_BASE_URL}/sites/${siteId}/pages?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-Naver-Client-Id': credentials.apiKey,
          'X-Naver-Client-Secret': credentials.apiSecret,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Naver API pages failed:', error)
      return []
    }

    const data = await response.json()
    return data.pages || []
  } catch (error) {
    console.error('Failed to fetch Naver pages:', error)
    return []
  }
}
