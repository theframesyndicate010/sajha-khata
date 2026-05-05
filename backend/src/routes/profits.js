import express from "express";
import { profitController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";

const router = express.Router();

router.get("/", requireAuth, validateQuery({}), profitController.getProfitSummary);
router.post(
	"/distributions",
	requireAuth,
	validateBody({
		distributions: { type: "array", minItems: 1 }
	}),
	profitController.recordDistributions
);
router.delete(
	"/distributions/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	profitController.deleteDistribution
);

export default router;
