import mongoose from 'mongoose';

const cakeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String], required: true },
  category: { type: String, required: true },
}, { timestamps: true });

export const Cake = mongoose.models.Cake || mongoose.model('Cake', cakeSchema);

