import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Category } from "../models/Category.js";
import { Transaction } from "../models/Transaction.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function monthRange(month, year) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

async function getActualSpent({ userId, categoryId, month, year }) {
  const { start, end } = monthRange(month, year);
  const agg = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(String(userId)),
        category: new mongoose.Types.ObjectId(String(categoryId)),
        type: "Expense",
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return agg[0]?.total || 0;
}

export const listBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const filter = { user: req.user._id };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const budgets = await Budget.find(filter)
    .populate("category", "name type color")
    .sort({ year: -1, month: -1, createdAt: -1 });

  const enriched = await Promise.all(
    budgets.map(async (b) => {
      const actualSpent =
        b.category?.type === "Expense"
          ? await getActualSpent({
              userId: req.user._id,
              categoryId: b.category._id,
              month: b.month,
              year: b.year,
            })
          : 0;
      const remaining = Math.max(0, b.amount - actualSpent);
      const percentUsed = b.amount === 0 ? 0 : Math.min(100, (actualSpent / b.amount) * 100);
      const isOverBudget = actualSpent > b.amount;
      return {
        ...b.toObject(),
        actualSpent,
        remaining,
        percentUsed,
        isOverBudget,
        alert: isOverBudget ? "Spending exceeded budget" : null,
      };
    })
  );

  res.json({ budgets: enriched });
});

export const createBudget = asyncHandler(async (req, res) => {
  const { category, amount, month, year } = req.body;

  const cat = await Category.findOne({ _id: category, user: req.user._id });
  if (!cat) throw new AppError("Category not found", 404);
  if (cat.type !== "Expense") throw new AppError("Budgets are only for Expense categories", 422);

  const budget = await Budget.create({
    user: req.user._id,
    category,
    amount,
    month,
    year,
  });

  const actualSpent = await getActualSpent({
    userId: req.user._id,
    categoryId: category,
    month,
    year,
  });

  res.status(201).json({
    budget: {
      ...(await Budget.findById(budget._id).populate("category", "name type color")).toObject(),
      actualSpent,
      remaining: Math.max(0, amount - actualSpent),
      percentUsed: amount === 0 ? 0 : Math.min(100, (actualSpent / amount) * 100),
      isOverBudget: actualSpent > amount,
      alert: actualSpent > amount ? "Spending exceeded budget" : null,
    },
  });
});

export const updateBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid id", 422);

  const budget = await Budget.findOne({ _id: id, user: req.user._id });
  if (!budget) throw new AppError("Budget not found", 404);

  const { category, amount, month, year } = req.body;

  const finalCategory = category ?? budget.category;
  const finalMonth = month ?? budget.month;
  const finalYear = year ?? budget.year;

  if (category !== undefined) {
    const cat = await Category.findOne({ _id: finalCategory, user: req.user._id });
    if (!cat) throw new AppError("Category not found", 404);
    if (cat.type !== "Expense") throw new AppError("Budgets are only for Expense categories", 422);
  }

  if (category !== undefined) budget.category = category;
  if (amount !== undefined) budget.amount = amount;
  if (month !== undefined) budget.month = month;
  if (year !== undefined) budget.year = year;

  await budget.save();

  const populated = await Budget.findById(budget._id).populate("category", "name type color");
  const actualSpent = await getActualSpent({
    userId: req.user._id,
    categoryId: populated.category._id,
    month: finalMonth,
    year: finalYear,
  });

  res.json({
    budget: {
      ...populated.toObject(),
      actualSpent,
      remaining: Math.max(0, populated.amount - actualSpent),
      percentUsed:
        populated.amount === 0 ? 0 : Math.min(100, (actualSpent / populated.amount) * 100),
      isOverBudget: actualSpent > populated.amount,
      alert: actualSpent > populated.amount ? "Spending exceeded budget" : null,
    },
  });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const budget = await Budget.findOneAndDelete({ _id: id, user: req.user._id });
  if (!budget) throw new AppError("Budget not found", 404);
  res.json({ ok: true });
});

