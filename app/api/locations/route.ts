import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Location } from "@/models/location";
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
    const cacheKey = CACHE_KEYS.LOCATIONS;

    // ISR Strategy
    if (cachingEnabled && cachingStrategy === "isr") {
      revalidateTag(cacheKey);
      return NextResponse.json(await Location.find({}).sort({ name: 1 }));
    }

    // Redis Strategy
    if (cachingEnabled && cachingStrategy === "redis") {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // Cache miss: Fetch from DB and store in Redis
      const data = await Location.find({}).sort({ name: 1 });
      await setToCache(cacheKey, data, 3600); // Cache for 1 hour
      return NextResponse.json(data);
    }

    // Default behavior: Fetch directly from DB if caching is disabled
    return NextResponse.json(await Location.find({}).sort({ name: 1 }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

// export async function GET() {
//   try {
//     await clientPromise
//     const locations = await Location.find({}).sort({ name: 1 })
//     return NextResponse.json(locations)
//   } catch (error) {
//     console.error("Error fetching locations:", error)
//     return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
//   }
// }

export async function POST(request: Request) {
  try {
    await clientPromise
    const { name, state, latitude, longitude,isAvailable } = await request.json()
    const location = await Location.create({ name, state, latitude, longitude,isAvailable })
    return NextResponse.json(location)
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}

