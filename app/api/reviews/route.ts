import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const { cakeId, rating, comment } = await request.json();

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }
//console.log(cake,"cake");
    cake.reviews.push({
      userId: session.user.id,
      username: session.user.name,
      rating,
      comment,
    });

    await cake.save();

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

