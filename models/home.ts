import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema(
  {
    heroTitle: String,
    heroSubtitle: String,
    heroImage: String,
    buttonText: String,
    buttonLink: String,
  },
  { timestamps: true }
);

export const Home = mongoose.models.Home || mongoose.model('Home', homeSchema);
