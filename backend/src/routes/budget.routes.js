import { Router } from "express";
import { body, param, query } from "express-validator";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createBudget, deleteBudget, listBudgets, updateBudget } from "../controllers/budget.controller.js";

const router = Router();
router.use(protect);

router.get(
  "/",
  [
    query("month").optional().isInt({ min: 1, max: 12 }),
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    validate,
  ],
  listBudgets
);

router.post(
  "/",
  [
    body("category").isMongoId(),
    body("amount").isFloat({ min: 0 }),
    body("month").isInt({ min: 1, max: 12 }),
    body("year").isInt({ min: 2000, max: 2100 }),
    validate,
  ],
  createBudget
);

router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("category").optional().isMongoId(),
    body("amount").optional().isFloat({ min: 0 }),
    body("month").optional().isInt({ min: 1, max: 12 }),
    body("year").optional().isInt({ min: 2000, max: 2100 }),
    validate,
  ],
  updateBudget
);

router.delete(
  "/:id",
  [param("id").isMongoId(), validate],
  deleteBudget
);

export default router;

