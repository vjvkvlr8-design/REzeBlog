// Loading UI for Suspense
// 작성일: 2026-04-18

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#36393f]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto mb-4"></div>
        <p className="text-[#B9BBBE] animate-pulse">로딩 중...</p>
      </div>
    </div>
  )
}
