// Sidebar Component - Left Navigation
// 작성일: 2026-04-19

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Gamepad2, 
  BookOpen, 
  BarChart3, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const sidebarItems = [
  { href: '/', label: '대시보드', icon: Home },
  { href: '/game', label: '텍스트 게임', icon: Gamepad2 },
  { href: '/blog', label: '블로그', icon: BookOpen },
  { href: '/stats', label: '통계', icon: BarChart3 },
]

const bottomItems = [
  { href: '/help', label: '도움말', icon: HelpCircle },
  { href: '/settings', label: '설정', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-discord-1100 border-r border-discord-800 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-discord-400 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
          aria-label={isCollapsed ? '사이드바 확장' : '사이드바 축소'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
              isActive(item.href)
                ? 'bg-discord-brand text-white'
                : 'text-discord-300 hover:text-discord-100 hover:bg-discord-900'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : ''}`} />
            {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-discord-800 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-discord-400 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* User Profile (Mini) */}
      <div className="p-3 border-t border-discord-800">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-discord-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            R
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-discord-100 truncate">게스트</p>
              <p className="text-xs text-discord-500 truncate">로그인 필요</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
