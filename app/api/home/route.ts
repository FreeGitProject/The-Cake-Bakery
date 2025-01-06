/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Home } from '@/models/home';

// GET: Retrieve all Home entries
export async function GET() {
  try {
    await clientPromise;
    const homes = await Home.find({});
    return NextResponse.json(homes);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error:any) {
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 });
  }
}

// POST: Create or update a Home entry
export async function POST(request: Request) {
  try {
    await clientPromise;
    const data = await request.json();
    const { _id, ...rest } = data;

    let home;
    if (_id) {
      // Update existing entry
      home = await Home.findByIdAndUpdate(_id, rest, { new: true });
      if (!home) {
        return NextResponse.json({ error: 'Home entry not found' }, { status: 404 });
      }
    } else {
      // Create new entry
      home = new Home(rest);
      await home.save();
    }
    return NextResponse.json(home);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save home data' }, { status: 500 });
  }
}

// DELETE: Delete a Home entry by _id
export async function DELETE(request: Request) {
  try {
    await clientPromise;
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({ error: '_id is required' }, { status: 400 });
    }

    const deletedHome = await Home.findByIdAndDelete(_id);
    if (!deletedHome) {
      return NextResponse.json({ error: 'Home entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Home entry deleted successfully' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete home data' }, { status: 500 });
  }
}
