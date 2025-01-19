/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cake } from '@/models/cake';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
   // console.log('Connecting to database...');
    await clientPromise;

   // console.log('Fetching cakes...');
    const cakes = await Cake.aggregate([
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$reviews", []] } }, 0] }, // Check if reviews array is non-empty
              { $avg: "$reviews.rating" }, // Calculate the average rating
              0, // Default to 0 if no reviews
            ],
          },
        },
      },
    ]);

   // console.log('Cakes fetched successfully:', cakes);
    return NextResponse.json(cakes);
  } catch (error) {
    //console.error('Error fetching cakes:', error);
    return NextResponse.json({ error: `Failed to fetch cakes: ${error}` }, { status: 500 });
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
    const cake = await Cake.create(data);
    return NextResponse.json(cake);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cake' }, { status: 500 });
  }
}

