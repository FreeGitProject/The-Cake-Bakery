import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Razorpay'], required: true },
  orderStatus: { type: String, enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  shippingAddress: {
    name: String,
    address: String,
    email: String,
    city: String,
    zipCode: String,
    country: String,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

