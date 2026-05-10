import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parseDate(value) {
  const d = new Date(value);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(d.getTime())) return null;
  return d;
}

export const listTransactions = asyncHandler(async (req, res) => {
  const { category, type, startDate, endDate, q, page = "1", limit = "20" } = req.query;

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const d = parseDate(startDate);
      if (!d) throw new AppError("Invalid startDate", 422);
      filter.date.$gte = d;
    }
    if (endDate) {
      const d = parseDate(endDate);
      if (!d) throw new AppError("Invalid endDate", 422);
      filter.date.$lte = d;
    }
  }

  if (q) {
    filter.$or = [
      { title: { $regex: String(q), $options: "i" } },
      { note: { $regex: String(q), $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .populate("category", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    transactions: items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { title, amount, category, type, date, note } = req.body;

  const cat = await Category.findOne({ _id: category, user: req.user._id });
  if (!cat) throw new AppError("Category not found", 404);

  if (cat.type !== type) {
    throw new AppError("Transaction type must match category type", 422);
  }

  const tx = await Transaction.create({
    user: req.user._id,
    title,
    amount,
    category,
    type,
    date: new Date(date),
    note,
  });

  const populated = await Transaction.findById(tx._id).populate("category", "name type color");
  res.status(201).json({ transaction: populated });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid id", 422);

  const tx = await Transaction.findOne({ _id: id, user: req.user._id });
  if (!tx) throw new AppError("Transaction not found", 404);

  const { title, amount, category, type, date, note } = req.body;

  let finalCategoryId = category ?? tx.category;
  let finalType = type ?? tx.type;

  if (category !== undefined || type !== undefined) {
    const cat = await Category.findOne({ _id: finalCategoryId, user: req.user._id });
    if (!cat) throw new AppError("Category not found", 404);
    if (cat.type !== finalType) throw new AppError("Transaction type must match category type", 422);
  }

  if (title !== undefined) tx.title = title;
  if (amount !== undefined) tx.amount = amount;
  if (category !== undefined) tx.category = category;
  if (type !== undefined) tx.type = type;
  if (date !== undefined) tx.date = new Date(date);
  if (note !== undefined) tx.note = note;

  await tx.save();

  const populated = await Transaction.findById(tx._id).populate("category", "name type color");
  res.json({ transaction: populated });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tx = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
  if (!tx) throw new AppError("Transaction not found", 404);
  res.json({ ok: true });
});

