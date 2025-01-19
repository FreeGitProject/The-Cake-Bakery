import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { AdminSettings } from '@/models/adminSettings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const settings = await AdminSettings.findOne({}) || new AdminSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Failed to fetch admin settings' }, { status: 500 });
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
    const settings = await AdminSettings.findOneAndUpdate({}, data, { upsert: true, new: true });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: 'Failed to update admin settings' }, { status: 500 });
  }
}

