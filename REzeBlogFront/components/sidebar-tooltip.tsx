'use client'

import React, { useState } from 'react'

interface SidebarTooltipProps {
  text: string
  children: React.ReactNode
}

export function SidebarTooltip({ text, children }: SidebarTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="sidebar-tooltip-wrapper"
      style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {isHovered && (
        <div className="sidebar-tooltip">
          {text}
          <div className="sidebar-tooltip-triangle" />
        </div>
      )}
    </div>
  )
}
