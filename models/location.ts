import mongoose from "mongoose"

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  isAvailable: Boolean,
})

export const Location = mongoose.models.Location || mongoose.model("Location", locationSchema)

