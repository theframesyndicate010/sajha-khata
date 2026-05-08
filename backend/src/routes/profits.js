import express from "express";
import { getProfitSummary, recordDistributions } from "../controllers/profitController.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

router.get("/", requireAuth, getProfitSummary);

router.post(
  "/distributions",
  requireAuth,
  validateBody({
    distributions: { type: "array", minItems: 1 }
  }),
  recordDistributions
);

export default router;
