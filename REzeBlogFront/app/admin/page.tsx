// Admin Dashboard - 채널/게시글 관리 + 방문자 추적 + SEO 랭킹
// 보안: httpOnly 쿠키 인증 필수, 프론트에서 접근 불가
// 작성일: 2026-04-19 (Antigravity)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'overview' | 'channels' | 'visitors' | 'seo'

interface Analytics {
  overview: { totalVisitors: number; todayVisitors: number; pageViews: number; avgSessionDuration: string; bounceRate: string }
  topPages: { path: string; title: string; views: number; uniqueVisitors: number }[]
  referrers: { source: string; visitors: number; percentage: number }[]
  topKeywords: { keyword: string; clicks: number; impressions: number; position: number }[]
  searchRankings: {
    google: { keyword: string; rank: number; page: string }[]
    naver: { keyword: string; rank: number; page: string }[]
  }
  recentVisitors: { id: string; ip: string; country: string; referrer: string; pages: string[]; time: string; duration: string }[]
}

// 채널 관리 데이터 (하드코딩, DB 연동 예정)
const channelsData = [
  { id: 1, category: '환영', name: '환영합니다', postCount: 0 },
  { id: 2, category: '환영', name: '블로그-소개', postCount: 0 },
  { id: 3, category: '환영', name: '공지사항', postCount: 1 },
  { id: 4, category: '개발', name: 'nextjs-개발팁', postCount: 2 },
  { id: 5, category: '개발', name: '풀스택-가이드', postCount: 1 },
  { id: 6, category: '개발', name: '인디게임-개발', postCount: 1 },
  { id: 7, category: '인터랙티브 스토리', name: '스토리텔링-가이드', postCount: 1 },
  { id: 8, category: '인터랙티브 스토리', name: '텍스트게임-개발', postCount: 1 },
  { id: 9, category: '자유게시판', name: '일반', postCount: 5 },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setAnalytics(data)
        setLoading(false)
      })
      .catch(() => {
        setError('데이터 로드 실패')
        setLoading(false)
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dc-bg-tertiary)', color: 'var(--dc-text-normal)' }}>
      로딩 중...
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dc-bg-tertiary)', color: 'var(--dc-text-danger)' }}>
      {error}
    </div>
  )

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: '대시보드', icon: '📊' },
    { key: 'channels', label: '채널/게시글 관리', icon: '#' },
    { key: 'visitors', label: '방문자 추적', icon: '👥' },
    { key: 'seo', label: 'SEO 랭킹', icon: '🔍' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dc-bg-tertiary)', color: 'var(--dc-text-normal)' }}>
      {/* Top bar */}
      <div style={{
        height: 48, background: 'var(--dc-bg-secondary)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        boxShadow: 'var(--dc-elevation-low)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--dc-header-primary)' }}>
            REzeBlog Admin Panel
          </span>
        </div>
        <button onClick={handleLogout} style={{
          background: 'var(--dc-text-danger)', color: '#fff', border: 'none',
          padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          로그아웃
        </button>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: 4, padding: '12px 24px',
        background: 'var(--dc-bg-secondary)', borderBottom: '1px solid var(--dc-separator)',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
            background: tab === t.key ? 'var(--dc-brand)' : 'transparent',
            color: tab === t.key ? '#fff' : 'var(--dc-interactive-normal)',
            transition: 'background 0.15s, color 0.15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* OVERVIEW TAB */}
        {tab === 'overview' && analytics && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 20 }}>📊 트래픽 개요</h2>
            
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: '총 방문자', value: analytics.overview.totalVisitors.toLocaleString(), color: '#5865f2' },
                { label: '오늘 방문자', value: analytics.overview.todayVisitors.toString(), color: '#3ba55d' },
                { label: '페이지뷰', value: analytics.overview.pageViews.toLocaleString(), color: '#faa81a' },
                { label: '평균 체류', value: analytics.overview.avgSessionDuration, color: '#9b59b6' },
                { label: '이탈율', value: analytics.overview.bounceRate, color: '#ed4245' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20,
                  borderLeft: `4px solid ${stat.color}`,
                }}>
                  <div style={{ fontSize: 12, color: 'var(--dc-text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' as const }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--dc-header-primary)' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Top pages & Referrers side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 16 }}>🔥 인기 페이지</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>페이지</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>조회수</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>방문자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPages.map((page, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                        <td style={{ padding: '8px 4px', fontSize: 14, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title}</td>
                        <td style={{ textAlign: 'right', padding: '8px 4px', fontSize: 14, fontWeight: 600 }}>{page.views.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '8px 4px', fontSize: 14, color: 'var(--dc-text-muted)' }}>{page.uniqueVisitors.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 16 }}>🔗 유입 경로</h3>
                {analytics.referrers.map((ref, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{ref.source}</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{ref.visitors}명 ({ref.percentage}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--dc-bg-accent)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${ref.percentage}%`, background: 'var(--dc-brand)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHANNELS TAB */}
        {tab === 'channels' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dc-header-primary)' }}># 채널/게시글 관리</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'var(--dc-brand)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  + 카테고리 추가
                </button>
                <button style={{ background: 'var(--dc-text-positive)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  + 채널 추가
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dc-bg-tertiary)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)', fontWeight: 700 }}>카테고리</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)', fontWeight: 700 }}>채널명</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)', fontWeight: 700 }}>게시글 수</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)', fontWeight: 700 }}>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {channelsData.map(ch => (
                    <tr key={ch.id} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--dc-text-muted)' }}>▼ {ch.category}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: 'var(--dc-channel-icon)', marginRight: 4 }}>#</span>{ch.name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center' }}>
                        <span style={{ background: ch.postCount > 0 ? 'var(--dc-brand)' : 'var(--dc-interactive-muted)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                          {ch.postCount}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button style={{ background: 'var(--dc-bg-accent)', color: 'var(--dc-text-normal)', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✏️ 수정</button>
                          <button style={{ background: 'var(--dc-bg-accent)', color: 'var(--dc-text-normal)', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>📝 게시글</button>
                          <button style={{ background: 'rgba(237,66,69,0.2)', color: 'var(--dc-text-danger)', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISITORS TAB */}
        {tab === 'visitors' && analytics && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 20 }}>👥 실시간 방문자 추적</h2>

            <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dc-bg-tertiary)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)' }}>시간</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)' }}>IP</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)' }}>유입 경로 / 키워드</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)' }}>방문 페이지</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, color: 'var(--dc-text-muted)' }}>체류 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentVisitors.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--dc-text-muted)' }}>{v.time}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {v.ip} <span style={{ fontSize: 11, color: 'var(--dc-text-muted)' }}>({v.country})</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span style={{ color: 'var(--dc-text-link)' }}>{v.referrer}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {v.pages.map((p, i) => (
                          <span key={i}>
                            {i > 0 && <span style={{ color: 'var(--dc-text-muted)', margin: '0 2px' }}>→</span>}
                            <span style={{ color: 'var(--dc-text-normal)' }}>{p}</span>
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{v.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {tab === 'seo' && analytics && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 20 }}>🔍 검색 랭킹 & 키워드</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {/* Google Rankings */}
              <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#4285f4' }}>G</span> Google 검색 랭킹
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>키워드</th>
                      <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>순위</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.searchRankings.google.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                        <td style={{ padding: '10px 4px', fontSize: 14 }}>{item.keyword}</td>
                        <td style={{ textAlign: 'center', padding: '10px 4px' }}>
                          <span style={{
                            display: 'inline-block', minWidth: 32, padding: '2px 8px', borderRadius: 10,
                            fontSize: 14, fontWeight: 700, textAlign: 'center',
                            background: item.rank <= 3 ? '#3ba55d' : item.rank <= 10 ? '#faa81a' : '#ed4245',
                            color: '#fff',
                          }}>
                            {item.rank}위
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Naver Rankings */}
              <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#03c75a' }}>N</span> Naver 검색 랭킹
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>키워드</th>
                      <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>순위</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.searchRankings.naver.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                        <td style={{ padding: '10px 4px', fontSize: 14 }}>{item.keyword}</td>
                        <td style={{ textAlign: 'center', padding: '10px 4px' }}>
                          <span style={{
                            display: 'inline-block', minWidth: 32, padding: '2px 8px', borderRadius: 10,
                            fontSize: 14, fontWeight: 700,
                            background: item.rank <= 3 ? '#3ba55d' : item.rank <= 10 ? '#faa81a' : '#ed4245',
                            color: '#fff',
                          }}>
                            {item.rank}위
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Keywords */}
            <div style={{ background: 'var(--dc-bg-secondary)', borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-header-primary)', marginBottom: 16 }}>🔑 유입 키워드 TOP</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>키워드</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>클릭수</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>노출수</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>CTR</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--dc-text-muted)' }}>평균 순위</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topKeywords.map((kw, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dc-separator)' }}>
                      <td style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600 }}>{kw.keyword}</td>
                      <td style={{ textAlign: 'right', padding: '10px 4px', fontSize: 14, color: 'var(--dc-text-link)' }}>{kw.clicks}</td>
                      <td style={{ textAlign: 'right', padding: '10px 4px', fontSize: 14, color: 'var(--dc-text-muted)' }}>{kw.impressions.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '10px 4px', fontSize: 14 }}>{(kw.clicks / kw.impressions * 100).toFixed(1)}%</td>
                      <td style={{ textAlign: 'right', padding: '10px 4px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                          background: kw.position <= 3 ? '#3ba55d' : kw.position <= 10 ? '#faa81a' : '#ed4245',
                          color: '#fff',
                        }}>
                          {kw.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
