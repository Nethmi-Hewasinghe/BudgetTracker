import { Router } from "express";
import { body, param, query } from "express-validator";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();
router.use(protect);

router.get(
  "/",
  [
    query("category").optional().isMongoId(),
    query("type").optional().isIn(["Income", "Expense"]),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("q").optional().isString().trim().isLength({ min: 1, max: 120 }),
    query("page").optional().isInt({ min: 1, max: 100000 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  listTransactions
);

router.post(
  "/",
  [
    body("title").isString().trim().isLength({ min: 1, max: 120 }),
    body("amount").isFloat({ min: 0 }),
    body("category").isMongoId(),
    body("type").isIn(["Income", "Expense"]),
    body("date").isISO8601(),
    body("note").optional().isString().trim().isLength({ min: 1, max: 500 }),
    validate,
  ],
  createTransaction
);

router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
    body("amount").optional().isFloat({ min: 0 }),
    body("category").optional().isMongoId(),
    body("type").optional().isIn(["Income", "Expense"]),
    body("date").optional().isISO8601(),
    body("note").optional({ nullable: true }).isString().trim().isLength({ min: 0, max: 500 }),
    validate,
  ],
  updateTransaction
);

router.delete(
  "/:id",
  [param("id").isMongoId(), validate],
  deleteTransaction
);

export default router;

