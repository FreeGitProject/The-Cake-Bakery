/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user';
import { OTP } from '@/models/otp';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    await clientPromise;
    const { username, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is: ${otp}`,
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
    <img src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310828/The-cake-shop/New%20folder%20%287%29/New%20folder/favicon_n5ksg1.ico" alt="Cake Shop Logo" style="max-width: 100px; margin-bottom: 20px;">
    
    <h1 style="color: #ff6b6b;">Email Verification</h1>
    
    <p style="color: #34495e;">To complete your account setup, please use the One-Time Password (OTP) below:</p>
    
    <div style="background-color: #fff0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h2 style="color: #ff6b6b; margin-bottom: 10px;">Your OTP</h2>
      <div style="font-size: 24px; letter-spacing: 5px; color: #ff6b6b; font-weight: bold;">
        ${otp}
      </div>
    </div>
    
    <p style="color: #7f8c8d; font-size: 12px;">
      This OTP is valid for 10 minutes. Do not share it with anyone.
    </p>
    
    <div style="margin-top: 20px; color: #34495e;">
      <small>If you didn't request this verification, please ignore this email.</small>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 10px; color: #7f8c8d;">
    <small>© The Cake Shop | Secure Verification</small>
  </div>
</div>
      `,
    });

    return NextResponse.json({ message: 'User registered. Please check your email for OTP.' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

