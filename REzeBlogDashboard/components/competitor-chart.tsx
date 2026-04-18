// Competitor Analysis Chart Component
// 작성일: 2026-04-18

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CompetitorData {
  domain: string
  keywords: number
  top10: number
  visibility: number
}

export function CompetitorChart({ data }: { data: CompetitorData[] }) {
  const chartData = data.map(item => ({
    name: item.domain.replace('.com', ''),
    키워드: item.keywords,
    TOP10: item.top10,
    가시성: Math.round(item.visibility)
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
            }}
          />
          <Legend />
          <Bar dataKey="키워드" fill="#3b82f6" />
          <Bar dataKey="TOP10" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
