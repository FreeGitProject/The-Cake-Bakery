/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmationEmail(order: any) {
  const message = {
    from: process.env.EMAIL_FROM,
    to: order.shippingAddress.email,
    subject: `Order Confirmation - #${order.orderId}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${order.orderId} has been confirmed and paid.</p>
      <h2>Order Details:</h2>
      <ul>
        ${order.orderItems.map((item: any) => `
          <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
        `).join('')}
      </ul>
      <p><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
      <p>We'll notify you when your order has been shipped.</p>
    `,
  };

  await transporter.sendMail(message);
}

