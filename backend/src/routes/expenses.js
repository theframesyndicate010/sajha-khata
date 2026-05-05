import express from "express";
import { expenseController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";

const router = express.Router();

router.get(
	"/",
	requireAuth,
	validateQuery({
		page: { type: "number", required: false },
		limit: { type: "number", required: false },
		search: { type: "string", required: false },
		category: { type: "string", required: false },
		from: { type: "date", required: false },
		to: { type: "date", required: false }
	}),
	expenseController.getAllExpenses
);
router.post(
	"/",
	requireAuth,
	validateBody({
		name: { type: "string" },
		category: { type: "string" },
		amount: { type: "number" },
		date: { type: "date", required: false },
		method: { type: "string", required: false },
		notes: { type: "string", required: false },
		trend: { type: "string", required: false }
	}),
	expenseController.createExpense
);
router.put(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		name: { type: "string", required: false },
		category: { type: "string", required: false },
		amount: { type: "number", required: false },
		date: { type: "date", required: false },
		method: { type: "string", required: false },
		notes: { type: "string", required: false },
		trend: { type: "string", required: false }
	}),
	expenseController.updateExpense
);
router.delete(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	expenseController.deleteExpense
);

export default router;
