import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { userId, newRole } = await request.json()

    if (!["user", "admin"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, select: "username email role" },
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}

