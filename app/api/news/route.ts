import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { News } from '@/models/news';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

// export async function GET() {
//   try {
//     await clientPromise;
//     const news = await News.find({}).sort({ date: -1 });
//     return NextResponse.json(news);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
//   }
// }

import { AdminSettings } from "@/models/adminSettings";
import { getFromCache, setToCache } from "@/lib/redis";
import { revalidateTag } from "next/cache";
import { CACHE_KEYS } from "@/lib/cacheKeys"; // Import cache keys

export async function GET() {
  try {
    await clientPromise;

    // Fetch admin settings for caching
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? "isr";

    // Use the predefined cache key
    const cacheKey = CACHE_KEYS.NEWS;

    // ISR Strategy
    if (cachingEnabled && cachingStrategy === "isr") {
      revalidateTag(cacheKey);
      return NextResponse.json(await News.find({}).sort({ date: -1 }));
    }

    // Redis Strategy
    if (cachingEnabled && cachingStrategy === "redis") {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await News.find({}).sort({ date: -1 });
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    return NextResponse.json(await News.find({}).sort({ date: -1 }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const data = await request.json();
    const newsItem = await News.create(data);
    return NextResponse.json(newsItem);
  } catch  {
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}

