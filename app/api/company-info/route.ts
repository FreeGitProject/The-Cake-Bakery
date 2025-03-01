import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { CompanyInfo } from "@/models/companyInfo"

export async function GET() {
  try {
    await clientPromise
    const companyInfo = await CompanyInfo.findOne()
    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error("Error fetching company info:", error)
    return NextResponse.json({ error: "Failed to fetch company info" }, { status: 500 })
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
    const companyInfo = await CompanyInfo.create(data)
    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error("Error creating company info:", error)
    return NextResponse.json({ error: "Failed to create company info" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const data = await request.json()
    const companyInfo = await CompanyInfo.findOneAndUpdate({}, data, { new: true, upsert: true })
    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error("Error updating company info:", error)
    return NextResponse.json({ error: "Failed to update company info" }, { status: 500 })
  }
}

