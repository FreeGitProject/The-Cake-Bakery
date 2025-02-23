import mongoose from "mongoose"

const addonItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ["Popular", "Cake Toppers", "Candles", "Other"] },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true },
)

export const AddonItem = mongoose.models.AddonItem || mongoose.model("AddonItem", addonItemSchema)

