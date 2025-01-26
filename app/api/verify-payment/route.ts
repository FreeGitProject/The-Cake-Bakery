import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "@/models/order";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    // Validate the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // (Optional) Fetch the payment details from Razorpay for additional validation
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
   // console.log("Payment Details:", paymentDetails);

    if (paymentDetails.status !== "captured") {
      return NextResponse.json(
        { error: "Payment is not captured. Verification failed." },
        { status: 400 }
      );
    }

    // Update order status in your database (example code, replace with actual logic)
   // const orderId = razorpay_order_id; // Your system's order ID
   // console.log(`Order ${orderId} payment verified successfully!`);
  // Update the order in the database
 // Update order status in your database
 const updatedOrder = await Order.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "Completed",
    },
    { new: true } // Return the updated document
  );

  if (!updatedOrder) {
    return NextResponse.json(
      { error: "Order not found or could not be updated." },
      { status: 404 }
    );
  }
    try {
        await sendOrderConfirmationEmail(updatedOrder, "Online Payment"); //"Online Payment"
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
        // We don't want to fail the order creation if email sending fails
        // But we might want to log this error or handle it in some way
      }
    // Respond with success
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      paymentDetails,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error while verifying payment." },
      { status: 500 }
    );
  }
}
