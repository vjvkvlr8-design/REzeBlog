// 게임 분기 데이터 API
// 작성일: 2026-04-18

import { NextRequest, NextResponse } from 'next/server'
import { getGameBranch, sql } from '@/lib/db'

// GET: 특정 분기 또는 모든 분기 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('id')
    const stage = searchParams.get('stage')

    if (branchId) {
      // 특정 분기 조회
      const branch = await getGameBranch(branchId)
      
      if (!branch) {
        return NextResponse.json(
          { error: 'Branch not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        branch,
        seo: {
          title: branch.seo_title || branch.title,
          description: branch.seo_description || branch.description,
          keywords: branch.seo_keywords || []
        }
      })
    }

    if (stage) {
      // 스테이지별 분기 목록 조회
      const branches = await sql`
        SELECT * FROM game_branches 
        WHERE stage = ${stage} AND is_active = true
        ORDER BY sort_order ASC
      `
      return NextResponse.json({ branches })
    }

    // 모든 활성 분기 조회
    const branches = await sql`
      SELECT * FROM game_branches 
      WHERE is_active = true
      ORDER BY stage ASC, sort_order ASC
    `
    return NextResponse.json({ branches })

  } catch (error) {
    console.error('Branches API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
