import mongoose from 'mongoose';

const addonItemSchema = new mongoose.Schema({
  addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Addon', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});


const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake', required: true },
  name: { type: String, required: true },
  caketype: { type: String,required: true }, // cake or pastries
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  image: { type: String, required: true },
  cakeMessage: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  addonItems: [addonItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Online Payment'], required: true },
  orderStatus: { type: String, enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  shippingAddress: {
    name: String,
    address: String,
    email: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String,
    specialInstructions: String // Added field
  },
  deliveryDate: { type: String, required: true }, // Added field
  deliverySlot: { type: String, required: true }, // Added field
  isGift: { type: Boolean, default: false }, // Added field
  giftMessage: { type: String }, // Added field
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  orderNumber:{ type: String }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

