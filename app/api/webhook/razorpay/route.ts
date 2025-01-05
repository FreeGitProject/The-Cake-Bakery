import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Order } from '@/models/order';
import clientPromise from '@/lib/mongodb';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  const isAuthentic = verifyWebhookSignature(body, signature);

  if (!isAuthentic) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(body);

  try {
    await clientPromise;

    if (payload.event === 'payment.captured') {
      const order = await Order.findOne({ razorpayOrderId: payload.payload.payment.entity.order_id });

      if (order) {
        order.paymentStatus = 'Completed';
        order.razorpayPaymentId = payload.payload.payment.entity.id;
        await order.save();

        // Send order confirmation email
        await sendOrderConfirmationEmail(order);

        return NextResponse.json({ status: 'success' });
      }
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

