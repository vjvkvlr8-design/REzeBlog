import { MetadataRoute } from 'next'
import { db } from '@/lib/drizzle'
import { posts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rezeblog.vercel.app'

  // Static URLs (always included)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/game`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Check if we're in build environment without DB access
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL

  if (isBuildTime) {
    // Build time without DB: return only static URLs
    return staticUrls
  }

  // Runtime/Production with DB: fetch dynamic URLs
  try {
    const allPosts = await db
      .select({
        slug: posts.slug,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))

    const postUrls = allPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticUrls, ...postUrls]
  } catch (error) {
    // DB connection failed: return static URLs only
    console.warn('Sitemap: DB connection failed, returning static URLs only')
    return staticUrls
  }
}
