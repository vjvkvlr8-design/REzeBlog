// Ranking Table Component
// 작성일: 2026-04-18

interface RankingData {
  keyword: string
  ranking: number
  previous_ranking?: number
  rank_change?: number
  checked_at: Date
}

interface RankingTableProps {
  data: RankingData[]
  engine: 'naver' | 'google'
}

export function RankingTable({ data, engine }: RankingTableProps) {
  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-green-600'
    if (rank <= 20) return 'text-blue-600'
    if (rank <= 30) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getChangeIndicator = (change?: number) => {
    if (!change || change === 0) return <span className="text-gray-400">-</span>
    if (change > 0) return <span className="text-green-600">↑{change}</span>
    return <span className="text-red-600">↓{Math.abs(change)}</span>
  }

  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">키워드</th>
            <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">현재</th>
            <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">변화</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500">
                데이터가 없습니다. SEO 순위 추적을 시작하세요.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={`${item.keyword}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 text-sm text-gray-900 font-medium truncate max-w-xs">
                  {item.keyword}
                </td>
                <td className={`py-2 px-2 text-sm text-center font-bold ${getRankColor(item.ranking)}`}>
                  {item.ranking}
                </td>
                <td className="py-2 px-2 text-sm text-center">
                  {getChangeIndicator(item.rank_change)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
