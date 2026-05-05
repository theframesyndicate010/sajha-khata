import express from "express";
import { summaryController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { cacheResponse } from "../middleware/cache.js";

const router = express.Router();

router.get(
	"/",
	requireAuth,
	cacheResponse(30 * 1000, (req) => `${req.user?.id || "anon"}:${req.originalUrl}`),
	summaryController.getSummary
);

export default router;
