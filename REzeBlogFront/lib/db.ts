import postgres from 'postgres'

// PostgreSQL 연결 설정
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog'

// 개발 환경에서는 단일 인스턴스 사용
const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql<{}>
}

export const sql = globalForDb.sql ?? postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // 커넥션 풀 최대 10개
  idle_timeout: 20, // 20초 유휴 후 연결 종료
  connect_timeout: 10, // 10초 연결 타임아웃
})

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

// 게임 세션 조회
export async function getGameSession(userId: string) {
  const result = await sql`
    SELECT * FROM game_sessions 
    WHERE user_id = ${userId} 
    ORDER BY last_active_at DESC 
    LIMIT 1
  `
  return result[0] || null
}

// 게임 세션 생성/업데이트
export async function upsertGameSession(data: {
  userId: string
  currentStage?: string
  turnNumber?: number
  productionRate?: number
  unlockedMenus?: string[]
  employees?: any[]
  gameState?: Record<string, any>
  seoMetadata?: Record<string, any>
}) {
  const {
    userId,
    currentStage = 'intro',
    turnNumber = 0,
    productionRate = 0,
    unlockedMenus = [],
    employees = [],
    gameState = {},
    seoMetadata = {}
  } = data

  const result = await sql`
    INSERT INTO game_sessions (
      user_id, current_stage, turn_number, production_rate, 
      unlocked_menus, employees, game_state, seo_metadata
    ) VALUES (
      ${userId}, ${currentStage}, ${turnNumber}, ${productionRate},
      ${JSON.stringify(unlockedMenus)}, ${JSON.stringify(employees)},
      ${JSON.stringify(gameState)}, ${JSON.stringify(seoMetadata)}
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      current_stage = EXCLUDED.current_stage,
      turn_number = EXCLUDED.turn_number,
      production_rate = EXCLUDED.production_rate,
      unlocked_menus = EXCLUDED.unlocked_menus,
      employees = EXCLUDED.employees,
      game_state = EXCLUDED.game_state,
      seo_metadata = EXCLUDED.seo_metadata,
      updated_at = CURRENT_TIMESTAMP,
      last_active_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}

// 게임 분기 조회
export async function getGameBranch(branchId: string) {
  const result = await sql`
    SELECT * FROM game_branches 
    WHERE branch_id = ${branchId} AND is_active = true
  `
  return result[0] || null
}

// 스테이지별 게임 분기 목록 조회
export async function getGameBranchesByStage(stage: string) {
  return await sql`
    SELECT * FROM game_branches 
    WHERE stage = ${stage} AND is_active = true
    ORDER BY sort_order ASC
  `
}

// 게시글 조회 (슬러그 기준 - SEO 최적화)
export async function getPostBySlug(slug: string) {
  const result = await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug} AND p.is_published = true
  `
  return result[0] || null
}

// 연관 게시글 조회
export async function getRelatedPosts(postId: string, limit: number = 5) {
  return await sql`
    SELECT p.*, r.relevance_score, r.reason
    FROM posts p
    INNER JOIN related_posts r ON p.id = r.related_post_id
    WHERE r.post_id = ${postId} AND p.is_published = true
    ORDER BY r.relevance_score DESC
    LIMIT ${limit}
  `
}

// ============================================================
// 저장/로드 시스템 (Save/Load System)
// ============================================================

// 게임 저장 (특정 슬롯에)
export async function saveGame(userId: string, saveSlot: number = 1, saveData: {
  currentStage?: string
  turnNumber?: number
  productionRate?: number
  unlockedMenus?: string[]
  employees?: any[]
  inventory?: any[]
  gameState?: Record<string, any>
  seoMetadata?: Record<string, any>
  saveName?: string
}) {
  const {
    currentStage = 'intro',
    turnNumber = 0,
    productionRate = 0,
    unlockedMenus = [],
    employees = [],
    inventory = [],
    gameState = {},
    seoMetadata = {},
    saveName = `저장 ${saveSlot}`
  } = saveData

  // 기존 세션 업데이트 (자동 저장)
  await upsertGameSession({
    userId,
    currentStage,
    turnNumber,
    productionRate,
    unlockedMenus,
    employees,
    gameState,
    seoMetadata
  })

  // 저장 슬롯에 저장
  const result = await sql`
    INSERT INTO game_saves (
      user_id, save_slot, save_name, current_stage, turn_number,
      production_rate, unlocked_menus, employees, inventory,
      game_state, seo_metadata
    ) VALUES (
      ${userId}, ${saveSlot}, ${saveName}, ${currentStage}, ${turnNumber},
      ${productionRate}, ${JSON.stringify(unlockedMenus)}, ${JSON.stringify(employees)},
      ${JSON.stringify(inventory)}, ${JSON.stringify(gameState)}, ${JSON.stringify(seoMetadata)}
    )
    ON CONFLICT (user_id, save_slot)
    DO UPDATE SET
      save_name = EXCLUDED.save_name,
      current_stage = EXCLUDED.current_stage,
      turn_number = EXCLUDED.turn_number,
      production_rate = EXCLUDED.production_rate,
      unlocked_menus = EXCLUDED.unlocked_menus,
      employees = EXCLUDED.employees,
      inventory = EXCLUDED.inventory,
      game_state = EXCLUDED.game_state,
      seo_metadata = EXCLUDED.seo_metadata,
      saved_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}

// 저장된 게임 목록 조회
export async function getSavedGames(userId: string) {
  return await sql`
    SELECT 
      save_slot,
      save_name,
      current_stage,
      turn_number,
      saved_at,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - saved_at)) / 3600 as hours_ago
    FROM game_saves
    WHERE user_id = ${userId}
    ORDER BY save_slot ASC
  `
}

// 특정 슬롯에서 게임 로드
export async function loadGame(userId: string, saveSlot: number = 1) {
  const result = await sql`
    SELECT * FROM game_saves
    WHERE user_id = ${userId} AND save_slot = ${saveSlot}
  `
  return result[0] || null
}

// 저장 삭제
export async function deleteSave(userId: string, saveSlot: number) {
  await sql`
    DELETE FROM game_saves
    WHERE user_id = ${userId} AND save_slot = ${saveSlot}
  `
  return { deleted: true, slot: saveSlot }
}

// 자동 저장 (현재 진행 상황)
export async function autoSave(userId: string) {
  const session = await getGameSession(userId)
  if (!session) return null

  return await saveGame(userId, 0, {
    currentStage: session.current_stage,
    turnNumber: session.turn_number,
    productionRate: session.production_rate,
    unlockedMenus: session.unlocked_menus,
    employees: session.employees,
    gameState: session.game_state,
    seoMetadata: session.seo_metadata,
    saveName: '자동 저장'
  })
}

// 최근 저장 시간 조회
export async function getLastSaveTime(userId: string) {
  const result = await sql`
    SELECT saved_at FROM game_saves
    WHERE user_id = ${userId}
    ORDER BY saved_at DESC
    LIMIT 1
  `
  return result[0]?.saved_at || null
}
