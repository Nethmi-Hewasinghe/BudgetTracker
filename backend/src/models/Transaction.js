import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    type: { type: String, required: true, enum: ["Income", "Expense"], index: true },
    date: { type: Date, required: true, index: true },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);

