/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user'; // Assuming you have a User model
import { Order } from '@/models/order';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail } from '@/lib/email';


export async function POST(request: Request) {
  try {
    const session = await getServerSession();
   // console.log('OrderAPI', session);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;

    // Fetch user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { orderItems, totalAmount, paymentMethod, shippingAddress, razorpayOrderId, razorpayPaymentId } = await request.json();

    const newOrder = new Order({
      orderId: uuidv4(),
      userId: user._id, // Use the ID fetched from the database
      orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      razorpayOrderId,
      razorpayPaymentId,
    });
console.log("newOrder",newOrder);
    await newOrder.save();
    if (paymentMethod === 'Cash on Delivery') {
      try {
        await sendOrderConfirmationEmail(newOrder,'Cash on Delivery');
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // We don't want to fail the order creation if email sending fails
        // But we might want to log this error or handle it in some way
      }
    }
    
    return NextResponse.json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;

    // Fetch user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId !== String(user._id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
