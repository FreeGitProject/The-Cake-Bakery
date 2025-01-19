import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Favorite } from '@/models/favorite';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clientPromise;
    const { id } = params;
    await Favorite.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Favorite deleted successfully' });
  } catch  {
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 });
  }
}

