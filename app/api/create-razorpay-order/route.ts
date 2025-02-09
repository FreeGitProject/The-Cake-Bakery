import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/models/order';
import { authOptions } from "@/lib/auth";
import { getServerSession } from 'next-auth/next';
import { User } from '@/models/user';
import { Coupon } from '@/models/coupon';
import { generateOrderNumber } from '@/lib/orderCount';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    // Parse request data
    const { totalAmount, orderItems, paymentMethod, shippingAddress, couponCode,
      discountAmount, } = await request.json();

    // Ensure user session exists
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;

    // Find the user in the database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a new Razorpay order
    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: 'order_receipt_' + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);
 // Generate order number using the helper
 const orderNumber = await generateOrderNumber();
    // Create an order in the database
    const newOrder = new Order({
      orderId: uuidv4(),
      userId: user._id, // Use the user's database ID
      orderItems,
      totalAmount: totalAmount,
      paymentMethod,
      shippingAddress,
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id, // Associate with Razorpay order ID
      couponCode,
      discountAmount,
      orderNumber:orderNumber
    });

    await newOrder.save();
  if (couponCode) {
      await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usageCount: 1 } })
    }
    // Return both the Razorpay order and the database order
    return NextResponse.json({
      message: 'Order created successfully',
      razorpayOrder,
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
