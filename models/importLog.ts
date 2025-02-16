import mongoose from "mongoose"

const importLogSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    totalRecords: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    errorDetails: [{ type: String }],
  },
  { timestamps: true },
)

export const ImportLog = mongoose.models.ImportLog || mongoose.model("ImportLog", importLogSchema)

