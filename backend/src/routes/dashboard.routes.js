import { Router } from "express";
import { query } from "express-validator";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();
router.use(protect);

router.get(
  "/",
  [
    query("month").optional().isInt({ min: 1, max: 12 }),
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    validate,
  ],
  getDashboard
);

export default router;

