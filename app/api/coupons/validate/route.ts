import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Coupon } from "@/models/coupon"

export async function POST(request: Request) {
  try {
    await clientPromise
    const { code, orderTotal } = await request.json()

    const coupon = await Coupon.findOne({ code })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 })
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    if (orderTotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} not met` }, { status: 400 })
    }

    let discountAmount
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100
    } else {
      discountAmount = coupon.discountValue
    }

    return NextResponse.json({
      valid: true,
      discountAmount,
      couponCode: coupon.code,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}

