import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
})

const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  mapUrl: { type: String, required: true },
})

const hoursSchema = new mongoose.Schema({
  days: { type: String, required: true },
  open: { type: String, required: true },
  close: { type: String, required: true },
})

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
})

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: addressSchema, required: true },
  coordinates: { type: coordinatesSchema, required: true },
  hours: {
    weekdays: { type: hoursSchema, required: true },
    saturday: { type: hoursSchema, required: true },
    sunday: { type: hoursSchema, required: true },
  },
  contact: { type: contactSchema, required: true },
  features: [{ type: String }],
  specialHours: {
    festivals: { type: String },
    holidays: { type: String },
  },
})

const companyInfoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  locations: [locationSchema],
  socialMedia: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
  },
  delivery: {
    radius: { type: String, required: true },
    minimumOrder: { type: Number, required: true },
    partners: [{ type: String }],
  },
})

export const CompanyInfo = mongoose.models.CompanyInfo || mongoose.model("CompanyInfo", companyInfoSchema)

