import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Subscriber } from "@/models/subscriber"

export async function POST(request: Request) {
  try {
   // console.log("ema")
    await clientPromise
    const { email } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 })
    }
//console.log(email,"ema")
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const existingSubscriber = await Subscriber.findOne({ email })
    if (existingSubscriber) {
      return NextResponse.json({ message: "Email already subscribed" }, { status: 200 })
    }

    const newSubscriber = new Subscriber({ email })
    await newSubscriber.save()

    return NextResponse.json({ message: "Subscription successful" }, { status: 201 })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

