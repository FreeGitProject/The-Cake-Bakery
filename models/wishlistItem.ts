import mongoose from "mongoose"

const wishlistItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cakeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
  },
  { timestamps: true },
)

export const WishlistItem = mongoose.models.WishlistItem || mongoose.model("WishlistItem", wishlistItemSchema)

