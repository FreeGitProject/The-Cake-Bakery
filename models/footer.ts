import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema(
  {
    companyName: String,
    description: String,
    email: String,
    phone: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
  },
  { timestamps: true }
);

export const Footer = mongoose.models.Footer || mongoose.model('Footer', footerSchema);
