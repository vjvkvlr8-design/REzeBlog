import { ServerSidebar } from '@/components/server-sidebar'
import { ChannelSidebar } from '@/components/channel-sidebar'
import { ThreadPanel } from '@/components/thread-panel'
import { Suspense } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // vh, dvh 단위를 전면 폐기하고, 브라우저가 계산한 100% 영역에 절대 위치로 고정 (모바일 하단바 짤림 완벽 해결)
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden' }}>
      {/* Discord 3-column layout + Thread panel */}
      <ServerSidebar />
      <Suspense fallback={<div className="channel-sidebar" />}>
        <ChannelSidebar />
      </Suspense>
      <div className="chat-area" style={{ position: 'relative' }}>
        {children}
      </div>
      <Suspense fallback={null}>
        <ThreadPanel />
      </Suspense>
    </div>
  )
}
