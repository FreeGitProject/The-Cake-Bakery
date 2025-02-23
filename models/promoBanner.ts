import mongoose from "mongoose"

const promoBannerSchema = new mongoose.Schema({
  message: { type: String, required: true },
  link: { type: String, required: true },
  linkText: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  textColor: { type: String, required: true },
  icon: { type: String},
  isPriority:{ type: Boolean},
  createdAt: { type: Date, default: Date.now },

})

export const PromoBanner = mongoose.models.PromoBanner || mongoose.model("PromoBanner", promoBannerSchema)

