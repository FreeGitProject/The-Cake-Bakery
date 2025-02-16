/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic"; // Ensure it's always server-rendered

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ImportLog } from "@/models/importLog"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const sort = searchParams.get("sort") || "-createdAt"
    const status = searchParams.get("status")

    const query: any = {}
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [importLogs, total] = await Promise.all([
      ImportLog.find(query).sort(sort).skip(skip).limit(limit).populate("importedBy", "username"),
      ImportLog.countDocuments(query),
    ])

    return NextResponse.json({
      importLogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    })
  } catch (error) {
    console.error("Error fetching import logs:", error)
    return NextResponse.json({ error: "Failed to fetch import logs" }, { status: 500 })
  }
}

