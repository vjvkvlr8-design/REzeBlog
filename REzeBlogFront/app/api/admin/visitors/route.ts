import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { visitors, searchRankings } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { cookies } from 'next/headers';

function isAuthenticated(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')
  if (!token) return false

  try {
    const decoded = Buffer.from(token.value, 'base64').toString()
    const [prefix, , pass] = decoded.split(':')
    return prefix === 'admin' && pass === process.env.ADMIN_PASSWORD
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allVisitors = await db.select().from(visitors);

    const botAgents = ['googlebot', 'yeti', 'bingbot', 'gptbot'];
    let botTraffic = 0;
    let humanTraffic = 0;

    const keywordsMap: Record<string, number> = {};
    const multiViewsMap: Record<number, number> = {};

    allVisitors.forEach(v => {
      const isBot = botAgents.some(bot => v.userAgent?.toLowerCase().includes(bot));
      if (isBot) botTraffic++; else humanTraffic++;

      if (v.keyword) {
        keywordsMap[v.keyword] = (keywordsMap[v.keyword] || 0) + 1;
      }

      const pCount = Array.isArray(v.pages) ? v.pages.length : 1;
      multiViewsMap[pCount] = (multiViewsMap[pCount] || 0) + 1;
    });

    const totalSessions = allVisitors.length;

    const keywords = Object.entries(keywordsMap)
      .map(([keyword, count]) => ({ keyword, count, percentage: Math.round((count / Math.max(1, totalSessions)) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const multiViews = Object.entries(multiViewsMap)
      .map(([pages, users]) => ({ pages: Number(pages), users }))
      .sort((a, b) => a.pages - b.pages);

    return NextResponse.json({
      overview: { totalSessions, botTraffic, humanTraffic },
      keywords,
      multiViews
    });
  } catch (error) {
    console.error('Failed to fetch visitors insights:', error);
    return NextResponse.json({ error: 'Failed to Fetch' }, { status: 500 });
  }
}
