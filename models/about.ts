import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    title: String,
    description: Array<String>,
    imageUrl: String,
    founderName: String,
    foundedYear: Number,
  },
  { timestamps: true }
);

export const About = mongoose.models.About || mongoose.model('About', aboutSchema);
