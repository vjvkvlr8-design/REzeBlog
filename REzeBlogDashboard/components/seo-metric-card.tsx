// SEO Metric Card Component
// 작성일: 2026-04-18

import { ReactNode } from 'react'

interface SEOMetricCardProps {
  title: string
  value: number
  icon: ReactNode
  trend?: string
}

export function SEOMetricCard({ title, value, icon, trend }: SEOMetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
          {icon}
        </div>
        {trend && (
          <span className="text-sm font-medium text-gray-500">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  )
}
