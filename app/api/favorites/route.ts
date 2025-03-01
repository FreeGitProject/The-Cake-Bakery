import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Favorite } from '@/models/favorite';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { Cake } from '@/models/cake';
import { getFromCache, setToCache } from "@/lib/redis";
import { revalidateTag } from "next/cache";
import { CACHE_KEYS } from "@/lib/cacheKeys";
import { AdminSettings } from "@/models/adminSettings";

export async function GET() {
  try {
    await clientPromise;

    const caketype = "cake"; // Default to fetching cakes

    // Fetch admin settings for caching
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? "isr";

    // Use predefined cache key
    const cacheKey = CACHE_KEYS.FAVORITES_TOP3;

    // ISR Strategy
    if (cachingEnabled && cachingStrategy === "isr") {
      revalidateTag(cacheKey);
      return NextResponse.json(await Cake.aggregate([
        { $match: { caketype } },
        { $limit: 3 }
      ]));
    }

    // Redis Strategy
    if (cachingEnabled && cachingStrategy === "redis") {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await Cake.aggregate([
        { $match: { caketype } },
        { $limit: 3 }
      ]);
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default: Fetch directly from DB if caching is disabled
    return NextResponse.json(await Cake.aggregate([
      { $match: { caketype } },
      { $limit: 3 }
    ]));
  } catch (error) {
    console.error("Error fetching favorite cakes:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

//here is old code to get only fab cakes 
// export async function GET() {
//   try {
//     await clientPromise;
//     const favorites = await Favorite.find({});
//     return NextResponse.json(favorites);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
//   }
// }

//update get top 3 Favorite cakes 
// export async function GET() {
//   try {
//     //later we thing
//     const caketype="cake";
//     await clientPromise;
//     const favorites = await Cake.aggregate([
//       {
//         $match: {caketype} // Filter by caketype (either 'cake' or 'pastries')
//       },
//       {$limit: 3}
//     ]);
//     return NextResponse.json(favorites);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
//   }
// }
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clientPromise;
    const data = await request.json();
    const favorite = await Favorite.create(data);
    return NextResponse.json(favorite);
  } catch {
    return NextResponse.json({ error: 'Failed to create favorite' }, { status: 500 });
  }
}

