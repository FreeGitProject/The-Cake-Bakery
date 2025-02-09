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
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #fff5f5; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310828/The-cake-shop/New%20folder%20%287%29/New%20folder/favicon_n5ksg1.ico" alt="Cake Shop Logo" style="max-width: 100px; margin-bottom: 10px;">
    <h1 style="color: #ff6b6b; margin: 0;">Sweet Delights Order Confirmation</h1>
  </div>

  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p>Hello Cake Lover! 🍰</p>
    <p>Order #${order.orderNumber} is ready to sweeten your day!</p>

    <div style="background-color: #fff0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #ff6b6b; margin-bottom: 15px;">Your Delectable Order</h2>
      <ul style="list-style-type: none; padding: 0;">
        ${order.orderItems
          .map(
            (item: any) => `
          <li style="display: flex; align-items: center; border-bottom: 1px solid #ffcaca; padding: 10px 0;">
            <img src="${item.image}" alt="${
              item.name
            }" style="width: 70px; height: 70px; object-fit: cover; margin-right: 15px; border-radius: 5px;">
            <div style="flex-grow: 1;">
              <strong>${item.name}
                <small style="color: #7f8c8d;">${
                  item.weight ? `(${item.weight}${item.caketype === "cake" ? "Kg" : "pieces"})` : ""
                }</small>
              </strong>
              <div style="color: #666;">
                × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </li>
        `
          )
          .join("")}
      </ul>
      
      <div style="text-align: right; margin-top: 15px; font-weight: bold; color: #ff6b6b;">
        Total: ₹${order.totalAmount.toFixed(2)}
      </div>
    </div>

    ${
      isCOD
        ? `<div style="background-color: #ff9999; color: white; padding: 10px; border-radius: 5px; text-align: center;">
        💰 Cash on Delivery: Pay when your treats arrive!
      </div>`
        : `<div style="background-color: #ff9999; color: white; padding: 10px; border-radius: 5px; text-align: center;">
            💳 Payment Method: Online Payment Completed
          </div>`
    }
    
    <p style="color: #666;">We're preparing your order with love and care. Tracking details coming soon!</p>
    
    <div style="text-align: center; margin-top: 20px; color: #ff6b6b;">
      <small>Thank you for choosing The Cake Shop</small>
    </div>
  </div>
</div>
      `,
  };

  await transporter.sendMail(message);
}
