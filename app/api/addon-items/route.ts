import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { AddonItem } from "@/models/addonItem"

export async function GET(request: Request) {
  try {
    await clientPromise
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") // New search parameter
    const category = searchParams.get("category")
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {}
    if (category) {
      query.category = category
    }
    if (search) {
      query.name = { $regex: search, $options: "i" } // Case-insensitive search
    }
    const skip = (page - 1) * limit

    const [addonItems, total] = await Promise.all([
      AddonItem.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      AddonItem.countDocuments(query),
    ])

    return NextResponse.json({
      addonItems,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    })
  } catch (error) {
    console.error("Error fetching addon items:", error)
    return NextResponse.json({ error: "Failed to fetch addon items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const data = await request.json()
    const addonItem = await AddonItem.create(data)
    return NextResponse.json(addonItem)
  } catch (error) {
    console.error("Error creating addon item:", error)
    return NextResponse.json({ error: "Failed to create addon item" }, { status: 500 })
  }
}

