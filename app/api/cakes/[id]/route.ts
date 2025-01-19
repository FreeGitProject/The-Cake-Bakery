import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { ObjectId } from 'mongodb';
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await clientPromise;
    const cakeId = new ObjectId(params.id);
    const cakes = await Cake.aggregate([
      { $match: { _id: cakeId } },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$reviews", []] } }, 0] }, // Check if reviews array is non-empty
              { $avg: "$reviews.rating" }, // Calculate the average rating
              0, // Default to 0 if no reviews
            ],
          }
        }
      }
    ]);
   
    if (cakes.length === 0) {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }
    const cake = cakes[0]; // Extract the first (and only) object from the array
    return NextResponse.json(cake);
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch cake' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clientPromise;
    const data = await request.json();
    const cake = await Cake.findByIdAndUpdate(params.id, data, { new: true });
    if (!cake) {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }
    return NextResponse.json(cake);
  } catch  {
    return NextResponse.json({ error: 'Failed to update cake' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await clientPromise;
    const cake = await Cake.findByIdAndDelete(params.id);
    if (!cake) {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Cake deleted successfully' });
  } catch  {
    return NextResponse.json({ error: 'Failed to delete cake' }, { status: 500 });
  }
}

