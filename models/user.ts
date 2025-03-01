import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Home", "Work"
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }, // Mark the default address
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] }, // Array of addresses
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    selectedLocation: {
      name: String,
      state: String,
      latitude: Number,
      longitude: Number,
    },
    autoDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
