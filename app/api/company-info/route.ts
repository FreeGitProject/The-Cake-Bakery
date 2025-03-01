import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { CompanyInfo } from "@/models/companyInfo";
import { getFromCache, setToCache, deleteFromCache } from "@/lib/redis";
import { revalidateTag } from "next/cache";
import { CACHE_KEYS } from "@/lib/cacheKeys";

export async function GET() {
  try {
    await clientPromise;

    // Check cache first
    const cacheKey = CACHE_KEYS.COMPANY_INFO;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch from DB if not cached
    const companyInfo = await CompanyInfo.findOne();
    if (companyInfo) {
      await setToCache(cacheKey, companyInfo, 3600); // Cache for 1 hour
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json({ error: "Failed to fetch company info" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clientPromise;
    const data = await request.json();
    const companyInfo = await CompanyInfo.create(data);

    // Invalidate cache after creating new data
    await deleteFromCache(CACHE_KEYS.COMPANY_INFO);
    revalidateTag(CACHE_KEYS.COMPANY_INFO);

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error creating company info:", error);
    return NextResponse.json({ error: "Failed to create company info" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clientPromise;
    const data = await request.json();
    const companyInfo = await CompanyInfo.findOneAndUpdate({}, data, { new: true, upsert: true });

    // Invalidate cache after updating data
    await deleteFromCache(CACHE_KEYS.COMPANY_INFO);
    revalidateTag(CACHE_KEYS.COMPANY_INFO);

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error updating company info:", error);
    return NextResponse.json({ error: "Failed to update company info" }, { status: 500 });
  }
}
