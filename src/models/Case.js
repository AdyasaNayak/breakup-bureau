import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    partner: { type: String, required: true, trim: true },
    crime: { type: String, required: true, trim: true },
    damageLevel: {
      type: String,
      enum: ["mild", "moderate", "severe", "catastrophic"],
      default: "moderate",
    },
    compensation: { type: String, default: "TBD" },
    status: {
      type: String,
      enum: ["under investigation", "solved", "dismissed"],
      default: "under investigation",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);