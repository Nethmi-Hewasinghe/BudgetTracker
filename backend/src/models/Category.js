import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: { type: String, required: true, enum: ["Income", "Expense"], index: true },
    color: { type: String, trim: true, maxlength: 20 },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, type: 1, name: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);

