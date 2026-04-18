// SEO Score Chart Component
// 작성일: 2026-04-18

'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SEOTrendData {
  date: Date
  seo_score: number
  top10_count: number
  top20_count: number
}

export function SEOScoreChart({ data }: { data: SEOTrendData[] }) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    score: Math.round(item.seo_score),
    top10: item.top10_count,
    top20: item.top20_count
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
            }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#8b5cf6" 
            fill="#8b5cf6" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
