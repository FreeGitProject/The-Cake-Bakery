import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { WishlistItem } from "@/models/wishlistItem"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { id } = params
    const deletedItem = await WishlistItem.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!deletedItem) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Wishlist item deleted successfully" })
  } catch (error) {
    console.error("Error deleting wishlist item:", error)
    return NextResponse.json({ error: "Failed to delete wishlist item" }, { status: 500 })
  }
}

