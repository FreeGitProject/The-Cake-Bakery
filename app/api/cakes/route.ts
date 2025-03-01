/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { AdminSettings } from '@/models/adminSettings';
import { deleteFromCache, getFromCache, setToCache } from '@/lib/redis';
import { revalidateTag } from 'next/cache';

export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await clientPromise;
    
    // Parse query parameters
    const url = new URL(request.url);
    const caketype = url.searchParams.get("caketype"); // 'cake' or 'pastries'
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);
    const search = url.searchParams.get("search") || "";

    if (!caketype) {
    return NextResponse.json(
      { error: "Missing 'caketype' query parameter." },
      { status: 400 }
    );
    }
    // Get session
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';
    // Fetch admin settings
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? 'isr';
    const cacheKey = `cakes_${caketype}_category${category}_page${page}_limit${limit}_search${search}_admin${isAdmin}`;
    // Cache key for Redis
    //const cacheKey = `cakes_${caketype}`;

    // ISR Strategy: Use Next.js revalidation mechanism
    if (cachingEnabled && cachingStrategy === 'isr') {
      const data = await fetchCakes(caketype, category, page, limit, search,isAdmin);
      revalidateTag(cacheKey); // Tag for ISR caching
      return NextResponse.json(data);
    }

    // Redis Strategy: Check and serve cached data
    if (cachingEnabled && cachingStrategy === 'redis') {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData); // Return cached data
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await fetchCakes(caketype, category, page, limit, search,isAdmin);
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    const data = await fetchCakes(caketype, category, page, limit, search,isAdmin);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch cakes: ${error}` },
      { status: 500 }
    );
  }
}

// Helper function to fetch cakes from MongoDB
async function fetchCakes(caketype: string, category: string | null, page: number, limit: number, search: string,  isAdmin: boolean) {
  const skip = (page - 1) * limit;
  const query: any = { caketype };
  if (category) query.category = category;
  if (search) query.name = { $regex: new RegExp(search, 'i') };

    // Apply isPublished filter only for non-admin users
    if (!isAdmin) query.isPublished = true;

  const data = await Cake.aggregate([
    { $match: query },
    { $addFields: { averageRating: { $cond: [ { $gt: [{ $size: { $ifNull: ["$reviews", []] } }, 0] }, { $avg: "$reviews.rating" }, 0 ] } } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  const total = await Cake.countDocuments(query);
  return { data, total, page, limit };
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const data = await request.json();
    const cake = await Cake.create(data);

    // Fetch admin settings
    const settings = await AdminSettings.findOne({});

    // If enabled, send email to subscribers
    if (settings?.enableSubscribeSendMailWhenCreateCake) {
      await fetch(`${process.env.DOMAIN_URL}/api/newsletter/send-cake-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cake),
      });
    }

    // Delete the cache for cakes to ensure fresh data
    const cacheKey = 'cakes';
    await deleteFromCache(cacheKey);

    return NextResponse.json(cake);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cake' }, { status: 500 });
  }
}


