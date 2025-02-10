export const dynamic = "force-dynamic"; // Ensure it's always server-rendered

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const query = search
      ? {
          $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
        }
      : {}

    const [users, total] = await Promise.all([
      User.find(query, "username email role").skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ])

    return NextResponse.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

