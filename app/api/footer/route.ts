import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Footer } from '@/models/footer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    await clientPromise;
    const footer = await Footer.findOne({});
    return NextResponse.json(footer);
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
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
    const footer = await Footer.create(data);
    return NextResponse.json(footer);
  } catch  {
    return NextResponse.json({ error: 'Failed to create footer data' }, { status: 500 });
  }
}

