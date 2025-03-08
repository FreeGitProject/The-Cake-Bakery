import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true }, // Weight in grams or kilograms
    costPrice: { type: Number, required: true }, // Cost price for the specified weight
    sellPrice: { type: Number, required: true }, // Selling price for the specified weight
  },
  { _id: false }
);
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);
const cakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    caketype: { type: String, enum: ["cake", "pastries"], required: true }, // cake or pastries
    type: { type: String, enum: ["contains egg", "eggless"], required: true }, // Egg or Eggless
    prices: { type: [priceSchema], required: true }, // Array of prices for different weights
    image: { type: [String], required: true }, // Array of image URLs
    category: { type: String, required: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    isAvailable: Boolean,
    isPublished: Boolean,
    sku: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export const Cake = mongoose.models.Cake || mongoose.model("Cake", cakeSchema);
