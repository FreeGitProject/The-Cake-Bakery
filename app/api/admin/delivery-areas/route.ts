import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
//import { authOptions } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { DeliveryArea } from '@/models/deliveryArea';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const deliveryAreas = await DeliveryArea.find({});
    return NextResponse.json(deliveryAreas);
  } catch (error) {
    console.error('Error fetching delivery areas:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery areas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    await clientPromise;
    const data = await request.json();
    const deliveryArea = await DeliveryArea.create(data);
    return NextResponse.json(deliveryArea);
  } catch (error) {
    console.error('Error creating delivery area:', error);
    return NextResponse.json({ error: 'Failed to create delivery area' }, { status: 500 });
  }
}

