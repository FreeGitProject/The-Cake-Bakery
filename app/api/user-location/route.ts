import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { selectedLocation, autoDetected } = await request.json()
    const updatedUser = await User.findByIdAndUpdate(session.user.id, { selectedLocation, autoDetected }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User location updated successfully" })
  } catch (error) {
    console.error("Error updating user location:", error)
    return NextResponse.json({ error: "Failed to update user location" }, { status: 500 })
  }
}

