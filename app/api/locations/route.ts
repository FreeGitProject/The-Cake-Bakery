import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Location } from "@/models/location"

export async function GET() {
  try {
    await clientPromise
    const locations = await Location.find({}).sort({ name: 1 })
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

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

