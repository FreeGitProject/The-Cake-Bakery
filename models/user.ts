import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

