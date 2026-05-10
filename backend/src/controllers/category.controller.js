import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { user: req.user._id };
  if (type) filter.type = type;

  const categories = await Category.find(filter).sort({ type: 1, name: 1 });
  res.json({ categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color } = req.body;
  const category = await Category.create({
    user: req.user._id,
    name,
    type,
    color,
  });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne({ _id: id, user: req.user._id });
  if (!category) throw new AppError("Category not found", 404);

  const { name, type, color } = req.body;
  if (name !== undefined) category.name = name;
  if (type !== undefined) category.type = type;
  if (color !== undefined) category.color = color;

  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOneAndDelete({ _id: id, user: req.user._id });
  if (!category) throw new AppError("Category not found", 404);

  res.json({ ok: true });
});

