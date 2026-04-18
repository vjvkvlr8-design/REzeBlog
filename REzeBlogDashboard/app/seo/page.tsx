import { 
  getNaverRankings, 
  getGoogleRankings, 
  getKeywordExposure,
  getSEOTrend,
  getCompetitorAnalysis,
  getSEOSummary 
} from '@/lib/seo'
import { SEOMetricCard } from '@/components/seo-metric-card'
import { RankingTable } from '@/components/ranking-table'
import { SEOScoreChart } from '@/components/seo-score-chart'
import { CompetitorChart } from '@/components/competitor-chart'
import { Target, TrendingUp, TrendingDown, Award } from 'lucide-react'

export default async function SEODashboardPage() {
  const [naverRankings, googleRankings, keywordExposure, seoTrend, competitors, seoSummary] = await Promise.all([
    getNaverRankings(),
    getGoogleRankings(),
    getKeywordExposure(),
    getSEOTrend(30),
    getCompetitorAnalysis(),
    getSEOSummary()
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO 모니터링 대시보드</h1>
              <p className="text-gray-600 mt-2">검색 순위 추적 및 노출 현황 분석</p>
            </div>
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← 메인 대시보드로
            </a>
          </div>
        </header>

        {/* SEO Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SEOMetricCard
            title="TOP 10 키워드"
            value={seoSummary?.top10_keywords || 0}
            icon={<Award className="w-6 h-6" />}
            trend="상위 노출"
          />
          <SEOMetricCard
            title="TOP 20 키워드"
            value={seoSummary?.top20_keywords || 0}
            icon={<Target className="w-6 h-6" />}
            trend="목표 달성"
          />
          <SEOMetricCard
            title="순위 상승"
            value={seoSummary?.improved_count || 0}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            trend="최근 7일"
          />
          <SEOMetricCard
            title="순위 하띠"
            value={seoSummary?.dropped_count || 0}
            icon={<TrendingDown className="w-6 h-6 text-red-600" />}
            trend="관심 필요"
          />
        </div>

        {/* SEO Score Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO 점수 트렌드 (30일)</h2>
          <SEOScoreChart data={seoTrend} />
        </div>

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              네이버 검색 순위
            </h2>
            <RankingTable data={naverRankings} engine="naver" />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              구글 검색 순위
            </h2>
            <RankingTable data={googleRankings} engine="google" />
          </div>
        </div>

        {/* Keyword Exposure & Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">키워드별 노출 현황</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">키워드</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">노출수</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">평균순위</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">최고순위</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordExposure.map((item) => (
                    <tr key={item.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.keyword}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">{item.exposure_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-center font-medium">
                        {Math.round(item.avg_ranking)}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 text-center font-medium">
                        {item.best_ranking}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">경쟁사 분석</h2>
            <CompetitorChart data={competitors} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</p>
        </footer>
      </div>
    </main>
  )
}
