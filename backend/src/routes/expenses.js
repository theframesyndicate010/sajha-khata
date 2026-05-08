import express from "express";
import { listExpenses, createExpense } from "../controllers/expenseController.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

router.get("/", requireAuth, listExpenses);

router.post(
  "/",
  requireAuth,
  validateBody({
    name: { type: "string" },
    category: { type: "string" },
    amount: { type: "number" },
    date: { type: "date" },
    method: { type: "string" },
    notes: { type: "string", required: false },
    trend: { type: "string", required: false }
  }),
  createExpense
);

export default router;
