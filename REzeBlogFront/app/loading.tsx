// Loading UI - Discord style
export default function Loading() {
  return (
    <>
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <span className="chat-header-name" style={{ opacity: 0.5 }}>로딩 중...</span>
      </div>
      <div className="chat-messages" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
            border: '3px solid var(--dc-interactive-muted)',
            borderTopColor: 'var(--dc-brand)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--dc-text-muted)', fontSize: 14 }}>채널을 불러오는 중...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </>
  )
}
