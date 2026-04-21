import { ServerSidebar } from '@/components/server-sidebar'
import { ChannelSidebar } from '@/components/channel-sidebar'
import { ThreadPanel } from '@/components/thread-panel'
import { Suspense } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%' }}>
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
