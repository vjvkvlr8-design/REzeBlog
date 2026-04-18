import { NextRequest, NextResponse } from 'next/server'
import { getGameSession, upsertGameSession, getGameBranch } from '@/lib/db'

// GET: 게임 세션 조회
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const session = await getGameSession(userId)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No active session', branch: 'intro' },
        { status: 200 }
      )
    }

    // 현재 분기 정보 조회
    const branch = await getGameBranch(session.current_stage)
    
    return NextResponse.json({
      session,
      branch,
      seo: session.seo_metadata || {
        title: '텍스트 어드벤처 - REzeBlog',
        description: '인터랙티브 스토리텔링 게임'
      }
    })
  } catch (error) {
    console.error('Game API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST: 게임 상태 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId = 'anonymous',
      currentStage,
      turnNumber,
      productionRate,
      unlockedMenus,
      employees,
      gameState,
      seoMetadata
    } = body

    const session = await upsertGameSession({
      userId,
      currentStage,
      turnNumber,
      productionRate,
      unlockedMenus,
      employees,
      gameState,
      seoMetadata
    })

    // 업데이트된 분기 정보 조회
    const branch = await getGameBranch(currentStage)

    return NextResponse.json({
      session,
      branch,
      message: 'Session updated successfully'
    })
  } catch (error) {
    console.error('Game API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
