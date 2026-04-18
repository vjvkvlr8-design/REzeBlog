// Popular Branches Table Component
// 작성일: 2026-04-18

interface BranchData {
  branch_id: string
  title: string
  visit_count: number
}

export function PopularBranches({ data }: { data: BranchData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">순위</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">분기 ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">제목</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">방문 수</th>
          </tr>
        </thead>
        <tbody>
          {data.map((branch, index) => (
            <tr key={branch.branch_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                {index + 1}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                {branch.branch_id}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {branch.title || '제목 없음'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                {branch.visit_count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
