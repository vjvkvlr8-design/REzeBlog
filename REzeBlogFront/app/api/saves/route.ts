// Save/Load API Routes
// 작성일: 2026-04-18
// 기능: 게임 저장/로드/목록/삭제 API

import { NextRequest, NextResponse } from 'next/server'
import { 
  saveGame, 
  loadGame, 
  getSavedGames, 
  deleteSave, 
  autoSave,
  getLastSaveTime 
} from '@/lib/db'

// GET: 저장된 게임 목록 조회 또는 특정 슬롯 로드
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const slot = searchParams.get('slot')
    const list = searchParams.get('list')

    // 저장 목록 조회
    if (list === 'true') {
      const saves = await getSavedGames(userId)
      return NextResponse.json({ 
        saves,
        count: saves.length,
        message: '저장 목록 조회 완료'
      })
    }

    // 특정 슬롯 로드
    if (slot) {
      const saveSlot = parseInt(slot, 10)
      if (isNaN(saveSlot) || saveSlot < 0 || saveSlot > 5) {
        return NextResponse.json(
          { error: '유효하지 않은 슬롯 번호 (0-5)' },
          { status: 400 }
        )
      }

      const saveData = await loadGame(userId, saveSlot)
      
      if (!saveData) {
        return NextResponse.json(
          { error: '저장된 데이터가 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        save: saveData,
        slot: saveSlot,
        message: '게임 로드 완료'
      })
    }

    // 마지막 저장 시간 조회
    const lastSave = await getLastSaveTime(userId)
    return NextResponse.json({
      lastSave,
      message: '마지막 저장 시간 조회 완료'
    })

  } catch (error) {
    console.error('Save Load API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST: 게임 저장
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const body = await request.json()
    
    const {
      slot = 1,
      name,
      currentStage,
      turnNumber,
      productionRate,
      unlockedMenus,
      employees,
      inventory,
      gameState,
      seoMetadata
    } = body

    // 슬롯 유효성 검사
    if (slot < 0 || slot > 5) {
      return NextResponse.json(
        { error: '유효하지 않은 슬롯 번호 (0-5)' },
        { status: 400 }
      )
    }

    const saved = await saveGame(userId, slot, {
      currentStage,
      turnNumber,
      productionRate,
      unlockedMenus,
      employees,
      inventory,
      gameState,
      seoMetadata,
      saveName: name || `저장 ${slot}`
    })

    return NextResponse.json({
      save: saved,
      slot,
      message: slot === 0 ? '자동 저장 완료' : `슬롯 ${slot}에 저장 완료`
    })

  } catch (error) {
    console.error('Save API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE: 저장 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const slot = searchParams.get('slot')

    if (!slot) {
      return NextResponse.json(
        { error: '슬롯 번호가 필요합니다' },
        { status: 400 }
      )
    }

    const saveSlot = parseInt(slot, 10)
    if (isNaN(saveSlot) || saveSlot < 1 || saveSlot > 5) {
      return NextResponse.json(
        { error: '유효하지 않은 슬롯 번호 (1-5)' },
        { status: 400 }
      )
    }

    await deleteSave(userId, saveSlot)

    return NextResponse.json({
      deleted: true,
      slot: saveSlot,
      message: `슬롯 ${saveSlot} 저장 삭제 완료`
    })

  } catch (error) {
    console.error('Delete Save API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
