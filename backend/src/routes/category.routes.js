import { Router } from "express";
import { body, param, query } from "express-validator";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.use(protect);

router.get(
  "/",
  [query("type").optional().isIn(["Income", "Expense"]), validate],
  listCategories
);

router.post(
  "/",
  [
    body("name").isString().trim().isLength({ min: 1, max: 50 }),
    body("type").isIn(["Income", "Expense"]),
    body("color").optional().isString().trim().isLength({ min: 1, max: 20 }),
    validate,
  ],
  createCategory
);

router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("name").optional().isString().trim().isLength({ min: 1, max: 50 }),
    body("type").optional().isIn(["Income", "Expense"]),
    body("color").optional({ nullable: true }).isString().trim().isLength({ min: 0, max: 20 }),
    validate,
  ],
  updateCategory
);

router.delete(
  "/:id",
  [param("id").isMongoId(), validate],
  deleteCategory
);

export default router;

