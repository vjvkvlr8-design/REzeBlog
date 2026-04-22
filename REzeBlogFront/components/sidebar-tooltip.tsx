'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SidebarTooltipProps {
  text: string
  children: React.ReactNode
}

export function SidebarTooltip({ text, children }: SidebarTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipTop, setTooltipTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      // Calculate vertical center of the icon
      setTooltipTop(rect.top + rect.height / 2)
    }
  }, [isHovered])

  return (
    <div 
      ref={containerRef}
      className="sidebar-tooltip-wrapper"
      style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {isHovered && (
        <div 
          className="sidebar-tooltip" 
          style={{ 
            position: 'fixed', 
            top: `${tooltipTop}px`, 
            left: '74px', // Exactly outside the 72px sidebar + 2px gap
            transform: 'translateY(-50%)'
          }}
        >
          {text}
          <div className="sidebar-tooltip-triangle" style={{ top: '50%' }} />
        </div>
      )}
    </div>
  )
}
