import mongoose from 'mongoose';

const deliveryAreaSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true },
}, { timestamps: true });

export const DeliveryArea = mongoose.models.DeliveryArea || mongoose.model('DeliveryArea', deliveryAreaSchema);

