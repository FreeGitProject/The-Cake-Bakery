import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
//import { OTP } from "@/models/otp"
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    await clientPromise
    const { email } = await request.json()

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now

    // Save reset token to user
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Send reset password email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const resetUrl = `${process.env.DOMAIN_URL}/reset-password?token=${resetToken}`

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    return NextResponse.json({ message: "Password reset email sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "An error occurred during password reset request" }, { status: 500 })
  }
}

