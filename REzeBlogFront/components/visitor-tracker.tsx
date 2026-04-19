// 방문자 추적 컴포넌트
// 페이지 방문 시 자동으로 방문자 기록 및 조회수 증가
// 작성일: 2026-04-19

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorTracker() {
  const pathname = usePathname()
  const startTime = useRef<number>(Date.now())
  const trackedPages = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!pathname) return

    // Prevent duplicate tracking for same page in same session
    if (trackedPages.current.has(pathname)) return
    trackedPages.current.add(pathname)

    // Track visitor
    async function trackVisit() {
      try {
        // Get referrer from document
        const referrer = document.referrer || undefined

        await fetch('/api/visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            referrer,
            duration: 0, // Will be updated when leaving page
          }),
        })
      } catch (err) {
        // Silently fail - tracking shouldn't break the app
        console.error('Visitor tracking failed:', err)
      }
    }

    trackVisit()

    // Update duration when leaving page
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000)

      // Use sendBeacon for reliable data sending on page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          page: pathname,
          duration,
        })
        navigator.sendBeacon('/api/visitor', new Blob([data], { type: 'application/json' }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname])

  // This component doesn't render anything visible
  return null
}
