import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken } from "../services/token.service.js";

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: "Food & Dining", type: "Expense", color: "#ef4444" },
  { name: "Transportation", type: "Expense", color: "#f97316" },
  { name: "Shopping", type: "Expense", color: "#ec4899" },
  { name: "Entertainment", type: "Expense", color: "#8b5cf6" },
  { name: "Utilities", type: "Expense", color: "#3b82f6" },
  { name: "Healthcare", type: "Expense", color: "#06b6d4" },
  { name: "Other", type: "Expense", color: "#6b7280" },
  // Income categories
  { name: "Salary", type: "Income", color: "#10b981" },
  { name: "Freelance", type: "Income", color: "#14b8a6" },
  { name: "Investment", type: "Income", color: "#f59e0b" },
  { name: "Other", type: "Income", color: "#6b7280" },
];

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  // Create default categories for the new user
  await Category.insertMany(
    DEFAULT_CATEGORIES.map((cat) => ({ ...cat, user: user._id }))
  );

  const token = signAccessToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const token = signAccessToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

