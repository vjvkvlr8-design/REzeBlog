import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core'

// ============================================
// ============================================
// Discord Clone Blog Schema
// ============================================

// User Auth Table (Level 0 = Admin, Level 3 = Member, Level 4 = Guest)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).notNull().unique(), // ID 겸 고정닉
  password: varchar('password', { length: 255 }).notNull(), // 해시된 비밀번호
  level: integer('level').default(3).notNull(), // 권한 레벨
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Server Icons (Leftmost 72px sidebar controlled by Admin Menu)
export const serverIcons = pgTable('server_icons', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // 서버/카테고리명
  iconUrl: text('icon_url'), // Base64 이미지나 외부 URL
  linkUrl: varchar('link_url', { length: 500 }).notNull(), // 클릭시 이동 경로
  orderIndex: integer('order_index').default(0).notNull(),
  isDiscordIcon: boolean('is_discord_icon').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Categories = Discord Channel Categories (▼ 환영, ▼ 개발, etc.)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // "환영", "개발"
  slug: varchar('slug', { length: 100 }).notNull().unique(), // "welcome", "dev"
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Channels = Discord Channels (#환영합니다, #nextjs-개발팁)
export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // "환영합니다"
  slug: varchar('slug', { length: 100 }).notNull().unique(), // "welcome"
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Posts = Discord Messages (Blog Posts)
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(), // Markdown content
  excerpt: varchar('excerpt', { length: 500 }), // Preview text
  author: varchar('author', { length: 100 }).default('관리자').notNull(),
  authorColor: varchar('author_color', { length: 7 }).default('#5865f2').notNull(), // Discord color
  avatarBg: varchar('avatar_bg', { length: 20 }).default('purple').notNull(), // purple, green, orange, etc.
  avatarLetter: varchar('avatar_letter', { length: 1 }).default('R').notNull(),
  authorIp: varchar('author_ip', { length: 45 }),
  authorPassword: varchar('author_password', { length: 255 }), // 비회원 삭제용 비밀번호
  channelId: integer('channel_id').references(() => channels.id, { onDelete: 'cascade' }),
  views: integer('views').default(0).notNull(),
  published: boolean('published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Comments = Discord Replies (Thread replies to messages)
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  author: varchar('author', { length: 100 }).default('방문자').notNull(),
  authorColor: varchar('author_color', { length: 7 }).default('#1abc9c').notNull(),
  avatarBg: varchar('avatar_bg', { length: 20 }).default('teal').notNull(),
  avatarLetter: varchar('avatar_letter', { length: 1 }).default('V').notNull(),
  authorIp: varchar('author_ip', { length: 45 }),
  authorPassword: varchar('author_password', { length: 255 }), // 비회원 삭제용 비밀번호
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Reactions = Discord Message Reactions (👍 3, 🔥 5)
export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  emoji: varchar('emoji', { length: 10 }).notNull(), // "👍", "🔥", "📖"
  count: integer('count').default(1).notNull(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  unq: unique().on(t.postId, t.emoji),
}))

// Visitor Tracking for Analytics
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  ip: varchar('ip', { length: 45 }).notNull(),
  country: varchar('country', { length: 100 }),
  referrer: varchar('referrer', { length: 500 }), // "Google: 인터랙티브 스토리텔링"
  keyword: varchar('keyword', { length: 200 }), // 유입 키워드
  userAgent: varchar('user_agent', { length: 500 }),
  pages: jsonb('pages').$type<string[]>().default([]), // 방문 페이지 배열
  duration: integer('duration'), // 체류 시간 (초)
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// SEO Search Rankings
export const searchRankings = pgTable('search_rankings', {
  id: serial('id').primaryKey(),
  engine: varchar('engine', { length: 20 }).notNull(), // "google" | "naver"
  keyword: varchar('keyword', { length: 200 }).notNull(),
  rank: integer('rank').notNull(),
  page: varchar('page', { length: 255 }).notNull(), // 해당 페이지 경로
  clicks: integer('clicks').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.engine, t.keyword),
}))

// ============================================
// Types
// ============================================
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type Reaction = typeof reactions.$inferSelect
export type NewReaction = typeof reactions.$inferInsert

export type Visitor = typeof visitors.$inferSelect
export type NewVisitor = typeof visitors.$inferInsert

export type SearchRanking = typeof searchRankings.$inferSelect
export type NewSearchRanking = typeof searchRankings.$inferInsert
