// PostgreSQL 연결 테스트
// 작성일: 2026-04-18

import { sql, getGameSession, upsertGameSession, getGameBranch } from './db'

describe('Database Connection', () => {
  afterAll(async () => {
    await sql.end()
  })

  test('PostgreSQL 연결 확인', async () => {
    const result = await sql`SELECT 1 as test`
    expect(result[0].test).toBe(1)
  })

  test('game_sessions 테이블 존재 확인', async () => {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_sessions'
      ) as exists
    `
    expect(result[0].exists).toBe(true)
  })

  test('game_branches 테이블 존재 확인', async () => {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_branches'
      ) as exists
    `
    expect(result[0].exists).toBe(true)
  })
})

describe('Game Session CRUD', () => {
  const testUserId = 'test-user-' + Date.now()

  afterAll(async () => {
    await sql`DELETE FROM game_sessions WHERE user_id LIKE 'test-user-%'`
    await sql.end()
  })

  test('새 게임 세션 생성', async () => {
    const session = await upsertGameSession({
      userId: testUserId,
      currentStage: 'intro',
      turnNumber: 1,
      productionRate: 0,
      unlockedMenus: [],
      employees: [],
      gameState: { started: true },
      seoMetadata: { title: 'Test' }
    })

    expect(session).toBeDefined()
    expect(session.user_id).toBe(testUserId)
    expect(session.current_stage).toBe('intro')
  })

  test('게임 세션 조회', async () => {
    const session = await getGameSession(testUserId)
    expect(session).toBeDefined()
    expect(session.user_id).toBe(testUserId)
  })

  test('게임 세션 업데이트', async () => {
    const updated = await upsertGameSession({
      userId: testUserId,
      currentStage: 'fire_lit',
      turnNumber: 2,
      productionRate: 10.5
    })

    expect(updated.current_stage).toBe('fire_lit')
    expect(updated.turn_number).toBe(2)
  })
})

describe('Game Branch Query', () => {
  afterAll(async () => {
    await sql.end()
  })

  test('intro 분기 조회', async () => {
    const branch = await getGameBranch('intro')
    expect(branch).toBeDefined()
    expect(branch.branch_id).toBe('intro')
  })

  test('fire_lit 분기 조회', async () => {
    const branch = await getGameBranch('fire_lit')
    expect(branch).toBeDefined()
    expect(branch.branch_id).toBe('fire_lit')
  })

  test('존재하지 않는 분기 조회', async () => {
    const branch = await getGameBranch('non-existent')
    expect(branch).toBeNull()
  })
})
