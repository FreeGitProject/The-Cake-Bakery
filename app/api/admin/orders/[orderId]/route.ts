import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/models/order';
import { User } from '@/models/user'; // Assuming you have a User model
import { authOptions } from "@/lib/auth";
// Helper function to check if the user is an admin
// async function isAdmin(userEmail: string) {
//   const user = await User.findOne({ email: userEmail });
//   return user?.role === 'admin';
// }

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
   
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;

    // Fetch user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is an admin
    // if (!(await isAdmin(session.user.email))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
  if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orderId } = params;
    const { orderStatus, paymentStatus } = await request.json()
    const updateData: { orderStatus?: string; paymentStatus?: string } = {}

     if (orderStatus && ["Placed", "Shipped", "Delivered", "Cancelled"].includes(orderStatus)) {
      updateData.orderStatus = orderStatus
    }

    if (paymentStatus && ["Pending", "Completed", "Failed"].includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        ...updateData,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
