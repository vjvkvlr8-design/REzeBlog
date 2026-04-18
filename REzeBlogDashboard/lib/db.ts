// Database connection for Dashboard
// 작성일: 2026-04-18

import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog'

const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql<{}>
}

export const sql = globalForDb.sql ?? postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

// 게임 통계 조회
export async function getGameStats() {
  const result = await sql`
    SELECT 
      COUNT(DISTINCT user_id) as total_users,
      COUNT(*) as total_sessions,
      AVG(turn_number) as avg_turns,
      MAX(turn_number) as max_turns
    FROM game_sessions
    WHERE created_at > NOW() - INTERVAL '30 days'
  `
  return result[0]
}

// 스테이지별 유저 분포
export async function getStageDistribution() {
  return await sql`
    SELECT 
      current_stage,
      COUNT(*) as user_count
    FROM game_sessions
    WHERE last_active_at > NOW() - INTERVAL '7 days'
    GROUP BY current_stage
    ORDER BY user_count DESC
  `
}

// 일별 활성 유저 트렌드
export async function getDailyActiveUsers(days: number = 30) {
  return await sql`
    SELECT 
      DATE(last_active_at) as date,
      COUNT(DISTINCT user_id) as active_users
    FROM game_sessions
    WHERE last_active_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(last_active_at)
    ORDER BY date ASC
  `
}

// 인기 분기 조회
export async function getPopularBranches() {
  return await sql`
    SELECT 
      gb.branch_id,
      gb.title,
      COUNT(gs.id) as visit_count
    FROM game_branches gb
    LEFT JOIN game_sessions gs ON gs.current_stage = gb.branch_id
    WHERE gs.last_active_at > NOW() - INTERVAL '30 days'
    GROUP BY gb.branch_id, gb.title
    ORDER BY visit_count DESC
    LIMIT 10
  `
}

// 블로그 통계
export async function getBlogStats() {
  const result = await sql`
    SELECT 
      (SELECT COUNT(*) FROM posts WHERE is_published = true) as total_posts,
      (SELECT COUNT(*) FROM categories) as total_categories,
      (SELECT COUNT(*) FROM user_logs WHERE action_type = 'page_view' AND created_at > NOW() - INTERVAL '30 days') as total_views
  `
  return result[0]
}
