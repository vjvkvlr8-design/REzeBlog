// Accessibility Components
// 작성일: 2026-04-18

'use client'

import { useEffect, useState } from 'react'

// Skip to main content link for keyboard navigation
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
                 bg-discord-brand text-white px-4 py-2 rounded-lg font-medium
                 focus:outline-none focus:ring-2 focus:ring-white"
    >
      메인 콘텐츠로 건너뛰기
    </a>
  )
}

// Visually hidden text for screen readers only
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">{children}</span>
  )
}

// Live region for dynamic announcements
export function LiveRegion({ 
  children, 
  level = 'polite',
  id 
}: { 
  children: React.ReactNode
  level?: 'polite' | 'assertive'
  id?: string
}) {
  return (
    <div
      id={id}
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}

// Keyboard focus indicator wrapper
export function Focusable({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`focus-visible:ring-2 focus-visible:ring-discord-brand focus-visible:ring-offset-2 focus-visible:ring-offset-discord-1000 ${className}`}>
      {children}
    </div>
  )
}

// Accessible button with keyboard support
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : 0}
      className={`focus:outline-none focus:ring-2 focus:ring-discord-brand focus:ring-offset-2 
                  disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

// Screen reader announcement hook
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState('')

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message)
    // Clear after announcement
    setTimeout(() => setAnnouncement(''), 1000)
  }

  return { announcement, announce }
}

// Reduced motion preference hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
