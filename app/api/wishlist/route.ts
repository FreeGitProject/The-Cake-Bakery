import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { WishlistItem } from "@/models/wishlistItem"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const wishlistItems = await WishlistItem.find({ userId: session.user.id })
    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error("Error fetching wishlist items:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const data = await request.json()
    const wishlistItem = new WishlistItem({
      userId: session.user.id,
      ...data,
    })
    await wishlistItem.save()
    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error("Error adding wishlist item:", error)
    return NextResponse.json({ error: "Failed to add wishlist item" }, { status: 500 })
  }
}

