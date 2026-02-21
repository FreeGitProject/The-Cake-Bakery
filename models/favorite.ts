import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    image: String,
    price: Number,
    isAvailable: Boolean,
  },
  { timestamps: true }
);

export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
