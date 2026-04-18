import Link from 'next/link'
import { 
  getGameStats, 
  getStageDistribution, 
  getDailyActiveUsers, 
  getPopularBranches,
  getBlogStats 
} from '@/lib/db'
import { MetricCard } from '@/components/metric-card'
import { StageChart } from '@/components/stage-chart'
import { DAUChart } from '@/components/dau-chart'
import { PopularBranches } from '@/components/popular-branches'
import { ExportButton } from '@/components/export-button'
import { Users, Gamepad, Eye, TrendingUp, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const [gameStats, stageDistribution, dailyUsers, popularBranches, blogStats] = await Promise.all([
    getGameStats(),
    getStageDistribution(),
    getDailyActiveUsers(30),
    getPopularBranches(),
    getBlogStats()
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">REzeBlog Dashboard</h1>
          <p className="text-gray-600 mt-2">게임 데이터 분석 및 SEO 모니터링</p>
        </header>

        {/* Quick Links - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            href="/seo" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg 
                       hover:bg-purple-700 transition-colors font-medium"
          >
            <span>📊</span> SEO 모니터링
            <ArrowRight className="w-4 h-4" />
          </Link>
          <ExportButton 
            data={popularBranches} 
            filename="popular-branches" 
            type="csv" 
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="총 유저 수"
            value={gameStats?.total_users || 0}
            icon={<Users className="w-6 h-6" />}
            trend="+12%"
          />
          <MetricCard
            title="총 세션"
            value={gameStats?.total_sessions || 0}
            icon={<Gamepad className="w-6 h-6" />}
            trend="+8%"
          />
          <MetricCard
            title="평균 턴 수"
            value={Math.round(gameStats?.avg_turns || 0)}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="+5%"
          />
          <MetricCard
            title="블로그 조회"
            value={blogStats?.total_views || 0}
            icon={<Eye className="w-6 h-6" />}
            trend="+15%"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">스테이지별 유저 분포</h2>
            <StageChart data={stageDistribution} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">일별 활성 유저 (30일)</h2>
            <DAUChart data={dailyUsers} />
          </div>
        </div>

        {/* Popular Branches with Export */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">인기 분기 TOP 10</h2>
            <div className="flex gap-2">
              <ExportButton 
                data={popularBranches} 
                filename="popular-branches" 
                type="csv" 
              />
              <ExportButton 
                data={popularBranches} 
                filename="popular-branches" 
                type="json" 
              />
            </div>
          </div>
          <PopularBranches data={popularBranches} />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</p>
        </footer>
      </div>
    </main>
  )
}
