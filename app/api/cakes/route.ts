/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { AdminSettings } from '@/models/adminSettings';
import { getFromCache, setToCache } from '@/lib/redis';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    // Connect to MongoDB
    await clientPromise;

    // Fetch admin settings
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? 'isr';

    // Cache key for Redis
    const cacheKey = 'cakes';

    // ISR Strategy: Use Next.js revalidation mechanism
    if (cachingEnabled && cachingStrategy === 'isr') {
      const data = await fetchCakes(); // Fetch data
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
      const data = await fetchCakes();
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    const data = await fetchCakes();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch cakes: ${error}` },
      { status: 500 }
    );
  }
}

// Helper function to fetch cakes from MongoDB
async function fetchCakes() {
  return Cake.aggregate([
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ["$reviews", []] } }, 0] }, // Check if reviews array is non-empty
            { $avg: "$reviews.rating" }, // Calculate the average rating
            0, // Default to 0 if no reviews
          ],
        },
      },
    },
  ]);
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
    return NextResponse.json(cake);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cake' }, { status: 500 });
  }
}

