import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken } from "../services/token.service.js";
import { DEFAULT_CATEGORIES } from "../config/defaultCategories.js";

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

  if (!user.passwordHash) {
    throw new AppError("This account uses Google sign-in. Use Continue with Google.", 401);
  }

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

