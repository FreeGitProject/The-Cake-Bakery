// models/counter.ts
import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "orderNumber"
  value: { type: Number, required: true, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
