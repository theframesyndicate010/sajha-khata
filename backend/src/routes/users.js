import express from "express";
import { userController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";

const router = express.Router();

router.get(
	"/",
	validateQuery({
		page: { type: "number", required: false },
		limit: { type: "number", required: false },
		search: { type: "string", required: false }
	}),
	userController.getAllUsers
);
router.get(
	"/:id",
	validateParams({
		id: { type: "uuid" }
	}),
	userController.getUserById
);
router.put(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		full_name: { type: "string", required: false },
		username: { type: "string", required: false },
		bio: { type: "string", required: false },
		avatar_url: { type: "string", required: false },
		phone: { type: "string", required: false }
	}),
	userController.updateProfile
);
router.delete(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	userController.deleteAccount
);
router.get(
	"/:id/stats",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	userController.getUserStats
);

export default router;
