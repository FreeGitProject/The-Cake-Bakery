import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  catalogPageSize: { type: Number, default: 20 },
  cachingEnabled: { type: Boolean, default: false },
  cachingStrategy: { type: String, enum: ['isr', 'redis'], default: 'isr' },
  recentViewsCount: { type: Number, default: 5 },
}, { timestamps: true });

export const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema);

