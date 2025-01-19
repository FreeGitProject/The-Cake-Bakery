import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { News } from '@/models/news';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await clientPromise;
    const news = await News.find({}).sort({ date: -1 });
    return NextResponse.json(news);
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
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
    const newsItem = await News.create(data);
    return NextResponse.json(newsItem);
  } catch  {
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}

