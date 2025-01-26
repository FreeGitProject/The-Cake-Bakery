import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    await clientPromise
    const { token, password } = await request.json()

    // Find user with the reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password and remove reset token
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "An error occurred during password reset" }, { status: 500 })
  }
}

