/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// export async function sendOrderConfirmationEmail(order: any) {
//   const message = {
//     from: process.env.EMAIL_FROM,
//     to: order.shippingAddress.email,
//     subject: `Order Confirmation - #${order.orderId}`,
//     html: `
//       <h1>Thank you for your order!</h1>
//       <p>Your order #${order.orderId} has been confirmed and paid.</p>
//       <h2>Order Details:</h2>
//       <ul>
//         ${order.orderItems.map((item: any) => `
//           <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
//         `).join('')}
//       </ul>
//       <p><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
//       <p>We'll notify you when your order has been shipped.</p>
//     `,
//   };
export async function sendOrderConfirmationEmail(
  order: any,
  paymentMethod: string = "Online Payment"
) {
  const isCOD = paymentMethod.toLowerCase() === "cash on delivery";

  const message = {
    from: process.env.EMAIL_FROM,
    to: order.shippingAddress.email,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #fff8f8 0%, #fff2f2 100%); padding: 30px;">
  <!-- Header Section -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px;">
    <img src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310828/The-cake-shop/New%20folder%20%287%29/New%20folder/favicon_n5ksg1.ico" alt="Cake Shop Logo" style="max-width: 120px; margin-bottom: 15px;">
    <h1 style="color: #d44f4f; margin: 0; font-size: 28px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px;">Order Confirmation</h1>
    <div style="width: 50px; height: 2px; background: #ff6b6b; margin: 15px auto;"></div>
    <p style="color: #888; font-size: 16px; margin: 0;">Order #${order.orderNumber}</p>
  </div>

  <div style="background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <!-- Welcome Message -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #d44f4f; font-size: 22px; margin: 0 0 15px 0;">Dear ${order.shippingAddress.name},</h2>
      <p style="color: #666; line-height: 1.6; margin: 0;">Thank you for choosing Sweet Delights. We're delighted to confirm your order and are already preparing your special treats with the utmost care and attention to detail.</p>
    </div>

    <!-- Delivery Information Grid -->
    <div style="background: linear-gradient(135deg, #fff8f8 0%, #fff2f2 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px;">
        <!-- Shipping Address -->
        <div>
          <h3 style="color: #d44f4f; font-size: 18px; margin: 0 0 15px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📍</span> Shipping Address
          </h3>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <p style="margin: 5px 0; font-size: 15px;"><strong>${order.shippingAddress.name}</strong></p>
            <p style="margin: 5px 0; color: #666;">${order.shippingAddress.phone}</p>
            <p style="margin: 5px 0; color: #666;">${order.shippingAddress.address}</p>
            <p style="margin: 5px 0; color: #666;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            <p style="margin: 5px 0; color: #666;">${order.shippingAddress.country}</p>
          </div>
        </div>

        <!-- Delivery Details -->
        <div>
          <h3 style="color: #d44f4f; font-size: 18px; margin: 0 0 15px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🕒</span> Delivery Schedule
          </h3>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <p style="margin: 5px 0; font-size: 15px;"><strong>Date:</strong> ${order.deliveryDate}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Time Slot:</strong> ${order.deliverySlot}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details -->
    <div style="margin-top: 30px;">
      <h3 style="color: #d44f4f; font-size: 20px; margin: 0 0 20px 0;">Order Summary</h3>
      <div style="background: linear-gradient(135deg, #fff8f8 0%, #fff2f2 100%); padding: 25px; border-radius: 12px;">
        <!-- Order Items -->
        ${order.orderItems.map((item: any) => `
          <div style="display: flex; align-items: center; background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 20px;">
            <div style="flex-grow: 1;">
              <h4 style="margin: 0 0 8px 0; color: #d44f4f; font-size: 16px;">${item.name}
                <span style="font-size: 14px; color: #888;">${item.weight ? `(${item.weight}${item.caketype === "cake" ? "Kg" : "pieces"})` : ""}</span>
              </h4>
              <p style="margin: 0; color: #666; font-size: 14px;">Quantity: ${item.quantity} × ₹${item.price.toFixed(2)}</p>
              ${item.cakeMessage ? `<p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">Message: "${item.cakeMessage}"</p>` : ''}
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #d44f4f; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        `).join('')}

        <!-- Price Summary -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666;">Subtotal</span>
            <span style="color: #666;">₹${order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
          </div>
          ${order.shippingFee ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Shipping Fee</span>
              <span style="color: #666;">₹${order.shippingFee.toFixed(2)}</span>
            </div>
          ` : ''}
          ${order.discount ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #2ecc71;">
              <span>Discount Applied</span>
              <span>-₹${order.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <span style="color: #d44f4f; font-size: 18px; font-weight: bold;">Total</span>
            <span style="color: #d44f4f; font-size: 18px; font-weight: bold;">₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Status -->
    <div style="margin-top: 30px; text-align: center;">
      <div style="background: ${isCOD ? '#fff8f8' : '#f0fff4'}; padding: 20px; border-radius: 12px; display: inline-block; min-width: 200px;">
        <p style="margin: 0; color: ${isCOD ? '#d44f4f' : '#2ecc71'}; font-weight: bold;">
          ${isCOD ? '💰 Cash on Delivery' : '✅ Payment Completed'}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
          ${isCOD ? `Amount due: ₹${order.totalAmount.toFixed(2)}` : 'Thank you for your payment'}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
      <p style="color: #888; margin: 0 0 10px 0;">Questions about your order?</p>
      <p style="color: #d44f4f; margin: 0 0 20px 0; font-weight: bold;">${process.env.EMAIL_FROM}</p>
      <div style="width: 50px; height: 2px; background: #ff6b6b; margin: 20px auto;"></div>
      <p style="color: #888; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Sweet Delights Cake Shop</p>
    </div>
  </div>
</div>
    `,
  };

  await transporter.sendMail(message);
}