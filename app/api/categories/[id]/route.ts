import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Category } from '@/models/category';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch  {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

