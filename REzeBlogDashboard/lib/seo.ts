// SEO Monitoring Utilities
// 작성일: 2026-04-18
// 목적: 검색 순위 추적 및 SEO 메트릭 수집

import { sql } from './db'

// 네이버 검색 순위 조회 (모의 데이터 - 실제 구현 시 API 연동)
export async function getNaverRankings() {
  // 실제 구현: 네이버 검색 API 또는 크롤링
  // 현재는 데이터베이스에서 저장된 순위 데이터 조회
  return await sql`
    SELECT 
      keyword,
      ranking,
      previous_ranking,
      (previous_ranking - ranking) as rank_change,
      checked_at
    FROM seo_rankings 
    WHERE search_engine = 'naver'
    AND checked_at > NOW() - INTERVAL '7 days'
    ORDER BY checked_at DESC, ABS(rank_change) DESC
    LIMIT 20
  `
}

// 구글 검색 순위 조회
export async function getGoogleRankings() {
  return await sql`
    SELECT 
      keyword,
      ranking,
      previous_ranking,
      (previous_ranking - ranking) as rank_change,
      checked_at
    FROM seo_rankings 
    WHERE search_engine = 'google'
    AND checked_at > NOW() - INTERVAL '7 days'
    ORDER BY checked_at DESC, ABS(rank_change) DESC
    LIMIT 20
  `
}

// 키워드별 노출 현황
export async function getKeywordExposure() {
  return await sql`
    SELECT 
      keyword,
      COUNT(*) as exposure_count,
      AVG(ranking) as avg_ranking,
      MIN(ranking) as best_ranking,
      MAX(ranking) as worst_ranking
    FROM seo_rankings
    WHERE checked_at > NOW() - INTERVAL '30 days'
    GROUP BY keyword
    ORDER BY avg_ranking ASC
    LIMIT 15
  `
}

// 일별 SEO 점수 트렌드
export async function getSEOTrend(days: number = 30) {
  return await sql`
    SELECT 
      DATE(checked_at) as date,
      AVG(CASE WHEN ranking <= 10 THEN 100 
               WHEN ranking <= 20 THEN 80
               WHEN ranking <= 30 THEN 60
               WHEN ranking <= 50 THEN 40
               ELSE 20 END) as seo_score,
      COUNT(CASE WHEN ranking <= 10 THEN 1 END) as top10_count,
      COUNT(CASE WHEN ranking <= 20 THEN 1 END) as top20_count
    FROM seo_rankings
    WHERE checked_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(checked_at)
    ORDER BY date ASC
  `
}

// 경쟁사 분석
export async function getCompetitorAnalysis() {
  // 모의 데이터 - 실제 구현 시 경쟁사 도메인 비교
  return [
    { domain: 'rezeblog.com', keywords: 45, top10: 12, visibility: 28.5 },
    { domain: 'competitor1.com', keywords: 62, top10: 18, visibility: 35.2 },
    { domain: 'competitor2.com', keywords: 38, top10: 8, visibility: 22.1 },
    { domain: 'competitor3.com', keywords: 51, top10: 15, visibility: 31.8 },
  ]
}

// 검색 엔진별 트래픽 비율
export async function getSearchEngineTraffic() {
  return await sql`
    SELECT 
      referrer_domain,
      COUNT(*) as visit_count,
      COUNT(DISTINCT session_id) as unique_sessions
    FROM user_logs
    WHERE action_type = 'page_view'
    AND referrer_domain IN ('google.com', 'naver.com', 'daum.net', 'bing.com')
    AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY referrer_domain
    ORDER BY visit_count DESC
  `
}

// 인기 검색어 (내부 검색)
export async function getPopularSearchTerms() {
  return await sql`
    SELECT 
      search_term,
      COUNT(*) as search_count,
      AVG(CASE WHEN found_results > 0 THEN 1 ELSE 0 END) as success_rate
    FROM search_logs
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY search_term
    ORDER BY search_count DESC
    LIMIT 20
  `
}

// SEO 메트릭 요약
export async function getSEOSummary() {
  const result = await sql`
    SELECT 
      (SELECT COUNT(DISTINCT keyword) FROM seo_rankings WHERE ranking <= 10 AND checked_at > NOW() - INTERVAL '7 days') as top10_keywords,
      (SELECT COUNT(DISTINCT keyword) FROM seo_rankings WHERE ranking <= 20 AND checked_at > NOW() - INTERVAL '7 days') as top20_keywords,
      (SELECT AVG(ranking) FROM seo_rankings WHERE checked_at > NOW() - INTERVAL '7 days') as avg_ranking,
      (SELECT COUNT(*) FROM seo_rankings WHERE rank_improved = true AND checked_at > NOW() - INTERVAL '7 days') as improved_count,
      (SELECT COUNT(*) FROM seo_rankings WHERE rank_dropped = true AND checked_at > NOW() - INTERVAL '7 days') as dropped_count
  `
  return result[0]
}
