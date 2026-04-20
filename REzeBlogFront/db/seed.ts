// Database Seed Script
// Fallback 데이터와 동일한 초기 데이터를 DB에 삽입
// 실행: npx tsx db/seed.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/rezeblog'

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1,
})

const db = drizzle(client, { schema })

async function seed() {
  console.log('Seeding database...')

  try {
    // 1. Categories
    const categoriesData = [
      { name: '▼ 환영', slug: 'welcome', order: 0 },
      { name: '▼ 개발', slug: 'dev', order: 1 },
      { name: '▼ 커뮤니티', slug: 'community', order: 2 },
    ]

    const insertedCategories = await db.insert(schema.categories)
      .values(categoriesData)
      .onConflictDoNothing()
      .returning()
    console.log(`Inserted ${insertedCategories.length} categories`)

    // Get category IDs
    const allCategories = await db.select().from(schema.categories)
    const welcomeCat = allCategories.find(c => c.slug === 'welcome')
    const devCat = allCategories.find(c => c.slug === 'dev')
    const communityCat = allCategories.find(c => c.slug === 'community')

    if (!welcomeCat || !devCat || !communityCat) {
      throw new Error('Categories not found after insertion')
    }

    // 2. Channels
    const channelsData = [
      { name: '환영합니다', slug: 'welcome', categoryId: welcomeCat.id, order: 0 },
      { name: '공지사항', slug: 'announcements', categoryId: welcomeCat.id, order: 1 },
      { name: 'Next.js 팁', slug: 'nextjs-tips', categoryId: devCat.id, order: 0 },
      { name: '인터랙티브 스토리', slug: 'interactive-story', categoryId: devCat.id, order: 1 },
      { name: 'SEO 전략', slug: 'seo-strategy', categoryId: devCat.id, order: 2 },
      { name: '일반', slug: 'general', categoryId: communityCat.id, order: 0 },
      { name: '질문과 답변', slug: 'qna', categoryId: communityCat.id, order: 1 },
    ]

    const insertedChannels = await db.insert(schema.channels)
      .values(channelsData)
      .onConflictDoNothing()
      .returning()
    console.log(`Inserted ${insertedChannels.length} channels`)

    // Get channel IDs
    const allChannels = await db.select().from(schema.channels)
    const generalChannel = allChannels.find(c => c.slug === 'general')

    if (!generalChannel) {
      throw new Error('General channel not found after insertion')
    }

    // 3. Posts
    const postsData = [
      {
        title: 'REzeBlog에 오신 것을 환영합니다!',
        slug: 'welcome-post',
        content: 'Discord 스타일의 인터랙티브 블로그 시스템입니다.\n\n검색엔진 최적화(SEO)와 함께 몰입형 텍스트 게임 경험을 제공합니다.\n\n왼쪽 사이드바에서 채널을 선택해 다양한 콘텐츠를 탐색해보세요.',
        excerpt: 'Discord 스타일의 인터랙티브 블로그 시스템입니다.',
        author: 'REzeBot',
        authorColor: '#5865f2',
        avatarBg: 'purple',
        avatarLetter: 'R',
        channelId: generalChannel.id,
        published: true,
      },
      {
        title: 'Next.js 14 App Router 핵심 팁 5가지',
        slug: 'nextjs-tips-1',
        content: '서버 컴포넌트와 클라이언트 컴포넌트를 효율적으로 사용하는 방법\n\n1. 데이터 페칭은 서버에서\n2. 인터랙션은 클라이언트에서\n3. 서버 액션으로 폼 처리\n4. Parallel Routes 활용\n5. Intercepting Routes로 모달 처리',
        excerpt: '서버 컴포넌트와 클라이언트 컴포넌트를 효율적으로 사용하는 방법',
        author: 'DevHunter',
        authorColor: '#ed4245',
        avatarBg: 'red',
        avatarLetter: 'D',
        channelId: allChannels.find(c => c.slug === 'nextjs-tips')?.id,
        published: true,
      },
      {
        title: '텍스트 기반 인터랙티브 스토리란?',
        slug: 'interactive-story-intro',
        content: 'Santa Inc.에서 영감을 받은 분기형 스토리텔링 시스템\n\n당신의 선택에 따라 이야기가 전개됩니다.\n\n플레이어의 결정이 게임 세계에 영향을 미치는 동적인 경험을 제공합니다.',
        excerpt: 'Santa Inc.에서 영감을 받은 분기형 스토리텔링 시스템',
        author: 'StoryMaker',
        authorColor: '#f39c12',
        avatarBg: 'orange',
        avatarLetter: 'S',
        channelId: allChannels.find(c => c.slug === 'interactive-story')?.id,
        published: true,
      },
    ]

    const insertedPosts = await db.insert(schema.posts)
      .values(postsData)
      .onConflictDoNothing()
      .returning()
    console.log(`Inserted ${insertedPosts.length} posts`)

    // Get post IDs
    const allPosts = await db.select().from(schema.posts)
    const welcomePost = allPosts.find(p => p.slug === 'welcome-post')

    if (!welcomePost) {
      throw new Error('Welcome post not found after insertion')
    }

    // 4. Reactions
    const reactionsData = [
      { emoji: '👋', count: 5, postId: welcomePost.id },
      { emoji: '🎉', count: 3, postId: welcomePost.id },
      { emoji: '🔥', count: 12, postId: allPosts.find(p => p.slug === 'nextjs-tips-1')?.id || welcomePost.id },
      { emoji: '📖', count: 8, postId: allPosts.find(p => p.slug === 'nextjs-tips-1')?.id || welcomePost.id },
      { emoji: '🎮', count: 7, postId: allPosts.find(p => p.slug === 'interactive-story-intro')?.id || welcomePost.id },
    ].filter(r => r.postId)

    const insertedReactions = await db.insert(schema.reactions)
      .values(reactionsData)
      .onConflictDoNothing()
      .returning()
    console.log(`Inserted ${insertedReactions.length} reactions`)

    // 5. Comments
    const commentsData = [
      {
        content: '멋진 디자인이네요! Discord 느낌이 정말 좋습니다.',
        author: '방문자',
        authorColor: '#1abc9c',
        avatarBg: 'teal',
        avatarLetter: 'V',
        postId: welcomePost.id,
      },
      {
        content: 'Santa Inc. 재밌게 했는데 기대됩니다!',
        author: '게이머',
        authorColor: '#2ecc71',
        avatarBg: 'green',
        avatarLetter: 'G',
        postId: allPosts.find(p => p.slug === 'interactive-story-intro')?.id || welcomePost.id,
      },
      {
        content: '한국어 인터랙티브 스토리는 처음 보네요.',
        author: '독자',
        authorColor: '#9b59b6',
        avatarBg: 'purple',
        avatarLetter: '독',
        postId: allPosts.find(p => p.slug === 'interactive-story-intro')?.id || welcomePost.id,
      },
    ].filter(c => c.postId)

    const insertedComments = await db.insert(schema.comments)
      .values(commentsData)
      .onConflictDoNothing()
      .returning()
    console.log(`Inserted ${insertedComments.length} comments`)

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()
