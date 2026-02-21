import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: String,
    date: Date,
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

export const News = mongoose.models.News || mongoose.model('News', newsSchema);
