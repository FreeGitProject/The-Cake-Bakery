import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user';
import { OTP } from '@/models/otp';

export async function POST(request: Request) {
  try {
    await clientPromise;
    const { email, otp } = await request.json();

    // Find OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Verify user
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Delete OTP
    await OTP.deleteOne({ email, otp });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 });
  }
}

