import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { About } from '@/models/about';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    await clientPromise;
    const about = await About.findOne({});
    return NextResponse.json(about);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clientPromise;
    const data = await request.json();
    const about = await About.create(data);
    return NextResponse.json(about);
  } catch {
    return NextResponse.json({ error: 'Failed to create about data' }, { status: 500 });
  }
}
