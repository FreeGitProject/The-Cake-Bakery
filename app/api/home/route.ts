/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Home } from '@/models/home';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { AdminSettings } from '@/models/adminSettings';
import {  getFromCache, setToCache } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import { CACHE_KEYS } from '@/lib/cacheKeys';
// GET: Retrieve all Home entries
export async function GET() {
  try {
    await clientPromise;

    // Fetch admin settings for caching
    const adminSettings = await AdminSettings.findOne().exec();
    const cachingEnabled = adminSettings?.cachingEnabled ?? false;
    const cachingStrategy = adminSettings?.cachingStrategy ?? 'isr';

    // Define cache key (without isAdmin)
    const cacheKey = CACHE_KEYS.HOME;

    // ISR Strategy
    if (cachingEnabled && cachingStrategy === 'isr') {
      const data = await fetchHomeData();
      revalidateTag(cacheKey);
      return NextResponse.json(data);
    }

    // Redis Strategy
    if (cachingEnabled && cachingStrategy === 'redis') {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await fetchHomeData();
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    const data = await fetchHomeData();
    return NextResponse.json(data);
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 });
  }
}

// Helper function to fetch Home data from MongoDB
async function fetchHomeData() {
  return await Home.find({});
}
// POST: Create or update a Home entry
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const data = await request.json();
    const { _id, ...rest } = data;

    let home;
    if (_id) {
      // Update existing entry
      home = await Home.findByIdAndUpdate(_id, rest, { new: true });
      if (!home) {
        return NextResponse.json({ error: 'Home entry not found' }, { status: 404 });
      }
    } else {
      // Create new entry
      home = new Home(rest);
      await home.save();
    }
    return NextResponse.json(home);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save home data' }, { status: 500 });
  }
}

// DELETE: Delete a Home entry by _id
export async function DELETE(request: Request) {
  try {
    await clientPromise;
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({ error: '_id is required' }, { status: 400 });
    }

    const deletedHome = await Home.findByIdAndDelete(_id);
    if (!deletedHome) {
      return NextResponse.json({ error: 'Home entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Home entry deleted successfully' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete home data' }, { status: 500 });
  }
}
