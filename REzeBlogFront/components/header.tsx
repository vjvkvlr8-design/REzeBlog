// Header Component - Top Navigation
// 작성일: 2026-04-19

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, Gamepad2, BookOpen, Menu, X, Search, User } from 'lucide-react'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/game', label: '게임', icon: Gamepad2 },
  { href: '/blog', label: '블로그', icon: BookOpen },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-discord-950 border-b border-discord-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-discord-100 font-bold text-xl hover:text-discord-brand transition-colors"
          >
            <span className="text-discord-brand">🎮</span>
            <span>REzeBlog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-discord-300 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button 
              className="p-2 text-discord-400 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
              aria-label="검색"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <button 
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-discord-300 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
              aria-label="사용자 메뉴"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">로그인</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-discord-300 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-discord-800">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-discord-300 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-discord-800">
                <button className="flex items-center gap-3 px-4 py-3 text-discord-300 hover:text-discord-100 hover:bg-discord-900 rounded-md transition-all w-full">
                  <User className="w-5 h-5" />
                  <span className="font-medium">로그인</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
