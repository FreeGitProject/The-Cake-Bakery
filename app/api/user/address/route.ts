import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user';


export async function POST(request: Request) {
  try {
   // Assuming `userId` is sent in the headers
   const userId = request.headers.get('user-id');
   if (!userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   await clientPromise;
   const { street, city, state, zipCode, country } = await request.json();

   const updatedUser = await User.findByIdAndUpdate(
     userId,
     {
       address: { street, city, state, zipCode, country },
     },
     { new: true }
   );

   if (!updatedUser) {
     return NextResponse.json({ error: 'User not found' }, { status: 404 });
   }

    return NextResponse.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'An error occurred while updating the address' }, { status: 500 });
  }
}

