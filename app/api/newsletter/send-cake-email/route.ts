/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { Subscriber } from "@/models/subscriber"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    await clientPromise
    const cake = await request.json()

    // Fetch all subscribers
    const subscribers = await Subscriber.find({})

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      subject: `New Cake Alert: ${cake.name}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #FF9494;">New Cake Alert!</h1>
              <h2 style="color: #4A4A4A;">${cake.name}</h2>
              <img src="${cake.image[0]}" alt="${cake.name}" style="max-width: 100%; height: auto; border-radius: 8px;">
              <p>${cake.description}</p>
              <h3 style="color: #4A4A4A;">Details:</h3>
              <ul>
                <li>Type: ${cake.type}</li>
                <li>Category: ${cake.category}</li>
                <li>Price: Starting from $₹{Math.min(...cake.prices.map((p: { sellPrice: any }) => p.sellPrice))}</li>
              </ul>
              <a href="${process.env.DOMAIN_URL}/cakes/${cake._id}" style="display: inline-block; background-color: #FF9494; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Cake</a>
            </div>
          </body>
        </html>
      `,
    }

    // Send email to all subscribers
    for (const subscriber of subscribers) {
      await transporter.sendMail({
        ...mailOptions,
        to: subscriber.email,
      })
    }

    return NextResponse.json({ message: "Emails sent successfully" })
  } catch (error) {
    console.error("Failed to send emails:", error)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}

