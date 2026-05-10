import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { Budget } from "../models/Budget.js";

function monthRange(month, year) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

export async function getDashboard(req, res) {
  const now = new Date();
  const month = Number(req.query.month || now.getUTCMonth() + 1);
  const year = Number(req.query.year || now.getUTCFullYear());

  const userId = new mongoose.Types.ObjectId(String(req.user._id));
  const { start, end } = monthRange(month, year);

  const [summaryAgg, expenseByCategory, monthlyIncomeExpense, recentTransactions, budgetsAgg] =
    await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "Expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $group: {
            _id: "$cat._id",
            name: { $first: "$cat.name" },
            color: { $first: "$cat.color" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: { year: "$_id.year", month: "$_id.month" },
            income: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "Income"] }, "$total", 0],
              },
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "Expense"] }, "$total", 0],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            income: 1,
            expense: 1,
          },
        },
      ]),
      Transaction.find({ user: req.user._id })
        .populate("category", "name type color")
        .sort({ date: -1, createdAt: -1 })
        .limit(10),
      Budget.aggregate([
        {
          $match: { user: userId, month, year },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $lookup: {
            from: "transactions",
            let: { categoryId: "$category" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user", userId] },
                      { $eq: ["$category", "$$categoryId"] },
                      { $eq: ["$type", "Expense"] },
                      { $gte: ["$date", start] },
                      { $lt: ["$date", end] },
                    ],
                  },
                },
              },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ],
            as: "spentAgg",
          },
        },
        {
          $addFields: {
            actualSpent: { $ifNull: [{ $first: "$spentAgg.total" }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            amount: 1,
            month: 1,
            year: 1,
            category: { _id: "$cat._id", name: "$cat.name", color: "$cat.color", type: "$cat.type" },
            actualSpent: 1,
          },
        },
      ]),
    ]);

  const summary = summaryAgg.reduce(
    (acc, row) => {
      if (row._id === "Income") acc.totalIncome = row.total;
      if (row._id === "Expense") acc.totalExpense = row.total;
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  const budgets = budgetsAgg.map((b) => {
    const remaining = Math.max(0, b.amount - b.actualSpent);
    const percentUsed = b.amount === 0 ? 0 : Math.min(100, (b.actualSpent / b.amount) * 100);
    const isOverBudget = b.actualSpent > b.amount;
    return {
      ...b,
      remaining,
      percentUsed,
      isOverBudget,
      alert: isOverBudget ? "Spending exceeded budget" : null,
    };
  });

  res.json({
    month,
    year,
    summary,
    charts: {
      expenseByCategory,
      monthlyIncomeExpense,
      budgets,
    },
    recentTransactions,
  });
}

