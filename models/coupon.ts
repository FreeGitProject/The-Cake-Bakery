import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema)

