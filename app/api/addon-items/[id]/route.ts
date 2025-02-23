import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { AddonItem } from "@/models/addonItem"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { id } = params
    const data = await request.json()
    const updatedAddonItem = await AddonItem.findByIdAndUpdate(id, data, { new: true })

    if (!updatedAddonItem) {
      return NextResponse.json({ error: "Addon item not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAddonItem)
  } catch (error) {
    console.error("Error updating addon item:", error)
    return NextResponse.json({ error: "Failed to update addon item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { id } = params
    const deletedAddonItem = await AddonItem.findByIdAndDelete(id)

    if (!deletedAddonItem) {
      return NextResponse.json({ error: "Addon item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Addon item deleted successfully" })
  } catch (error) {
    console.error("Error deleting addon item:", error)
    return NextResponse.json({ error: "Failed to delete addon item" }, { status: 500 })
  }
}

