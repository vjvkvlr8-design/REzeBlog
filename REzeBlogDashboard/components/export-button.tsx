// Data Export Button Component
// 작성일: 2026-04-18

'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'

interface ExportButtonProps {
  data: any[]
  filename: string
  type: 'csv' | 'json'
}

export function ExportButton({ data, filename, type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    if (data.length === 0) return
    
    setIsExporting(true)
    
    // Get headers from first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape values containing commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsExporting(false)
  }

  const exportToJSON = () => {
    setIsExporting(true)
    
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsExporting(false)
  }

  const handleExport = () => {
    if (type === 'csv') {
      exportToCSV()
    } else {
      exportToJSON()
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors text-sm font-medium"
      aria-label={`${type.toUpperCase()} 형식으로 데이터보내기`}
    >
      {type === 'csv' ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
      <span>{isExporting ? '보내는 중...' : `${type.toUpperCase()}보내기`}</span>
      <Download className="w-4 h-4" />
    </button>
  )
}
