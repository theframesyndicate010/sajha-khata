import express from "express";
import { projectController } from "../controllers/index.js";
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
		status: { type: "string", required: false, enum: ["Paid", "Partially Paid", "Pending"] }
	}),
	projectController.getAllProjects
);
router.get(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	projectController.getProjectById
);
router.post(
	"/",
	requireAuth,
	validateBody({
		client: { type: "string" },
		project: { type: "string" },
		totalAmount: { type: "number" },
		paidAmount: { type: "number", required: false },
		date: { type: "date", required: false },
		type: { type: "string", required: false },
		notes: { type: "string", required: false }
	}),
	projectController.createProject
);
router.put(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		client: { type: "string", required: false },
		project: { type: "string", required: false },
		totalAmount: { type: "number", required: false },
		status: { type: "string", required: false, enum: ["Paid", "Partially Paid", "Pending"] },
		date: { type: "date", required: false }
	}),
	projectController.updateProject
);
router.delete(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	projectController.deleteProject
);
router.post(
	"/:id/payments",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		amount: { type: "number" },
		date: { type: "date", required: false },
		type: { type: "string", required: false },
		notes: { type: "string", required: false }
	}),
	projectController.recordPayment
);

export default router;
