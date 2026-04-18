'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          오류가 발생했습니다
        </h1>
        <p className="text-[#B9BBBE] mb-6">
          예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="text-sm text-[#72767D] mb-6">
            오류 코드: {error.digest}
          </p>
        )}
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-[#5865F2] text-white px-6 py-2 rounded-lg hover:bg-[#4752C4] transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-block border border-[#72767D] text-white px-6 py-2 rounded-lg hover:bg-[#4F545C] transition-colors"
          >
            메인으로
          </Link>
        </div>
      </div>
    </div>
  )
}
