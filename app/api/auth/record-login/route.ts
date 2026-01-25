import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
// ...adjust the import path for your authOptions export:
import { authOptions } from "@/lib/auth";// <-- update to where you export authOptions
import clientPromise from '@/lib/mongodb';// <-- update to your DB connect helper
import { User } from '@/models/user';// <-- update to your User model path

export async function POST(req: Request) {
  // Ensure session (safer than trusting client-sent email)
  const session = await getServerSession(authOptions as any) as Session | null;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clientPromise;

  const email = session.user.email;
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const firstTime = !user.lastLogin; // treat missing lastLogin as first login
  user.lastLogin = new Date();
  await user.save();

  return NextResponse.json({ firstTime });
}