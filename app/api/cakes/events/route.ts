import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Cake } from "@/models/cake"

export async function GET() {
  try {
    await clientPromise
    //const currentDate = new Date()

    const eventCakes = await Cake.find({
      isEvent: true,
      //eventStartDate: { $lte: currentDate },
      //eventEndDate: { $gte: currentDate },
    })
      .sort({ averageRating: -1 })
      .limit(3)

    return NextResponse.json(eventCakes)
  } catch (error) {
    console.error("Failed to fetch event cakes:", error)
    return NextResponse.json({ error: "Failed to fetch event cakes" }, { status: 500 })
  }
}

