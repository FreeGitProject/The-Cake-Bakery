import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Footer } from '@/models/footer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
// export async function GET() {
//   try {
//     await clientPromise;
//     const footer = await Footer.findOne({});
//     return NextResponse.json(footer);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
//   }
// }
import { AdminSettings } from '@/models/adminSettings';
import { getFromCache, setToCache } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import { CACHE_KEYS } from '@/lib/cacheKeys';

export async function GET() {
  try {
    await clientPromise;

    // Fetch admin settings for caching
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? 'isr';

    // Define cache key
    const cacheKey = CACHE_KEYS.FOOTER;

    // ISR Strategy
    if (cachingEnabled && cachingStrategy === 'isr') {
      revalidateTag(cacheKey);
      return NextResponse.json(await Footer.findOne({}));
    }

    // Redis Strategy
    if (cachingEnabled && cachingStrategy === 'redis') {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await Footer.findOne({});
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    return NextResponse.json(await Footer.findOne({}));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
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
    const footer = await Footer.create(data);
    return NextResponse.json(footer);
  } catch  {
    return NextResponse.json({ error: 'Failed to create footer data' }, { status: 500 });
  }
}

