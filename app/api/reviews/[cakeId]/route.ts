import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';

export async function GET(request: Request, { params }: { params: { cakeId: string } }) {
  try {
    await clientPromise;
    const { cakeId } = params;

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }

    return NextResponse.json(cake.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

