import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DeliveryArea } from '@/models/deliveryArea';

export async function POST(request: Request) {
  try {
    await clientPromise;
    const { location } = await request.json();

    // Check if the location exists in the delivery areas
    const deliveryArea = await DeliveryArea.findOne({ pincode: location });

    if (deliveryArea) {
      return NextResponse.json({
        deliverable: true,
        message: "Delivery available in your area."
      });
    } else {
      return NextResponse.json({
        deliverable: false,
        message: "Sorry, delivery is not available in your area."
      });
    }
  } catch (error) {
    console.error('Error checking delivery availability:', error);
    return NextResponse.json({ error: 'Failed to check delivery availability' }, { status: 500 });
  }
}

