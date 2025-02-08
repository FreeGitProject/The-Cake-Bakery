import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Favorite } from '@/models/favorite';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { Cake } from '@/models/cake';
//here is old code to get only fab cakes 
// export async function GET() {
//   try {
//     await clientPromise;
//     const favorites = await Favorite.find({});
//     return NextResponse.json(favorites);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
//   }
// }

//update get top 3 Favorite cakes 
export async function GET() {
  try {
    //later we thing
    const caketype="cake";
    await clientPromise;
    const favorites = await Cake.aggregate([
      {
        $match: {caketype} // Filter by caketype (either 'cake' or 'pastries')
      },
      {$limit: 3}
    ]);
    return NextResponse.json(favorites);
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
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
    const favorite = await Favorite.create(data);
    return NextResponse.json(favorite);
  } catch {
    return NextResponse.json({ error: 'Failed to create favorite' }, { status: 500 });
  }
}

