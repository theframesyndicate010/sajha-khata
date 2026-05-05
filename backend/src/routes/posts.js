import express from "express";
import { postController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";

const router = express.Router();

router.post(
	"/",
	requireAuth,
	validateBody({
		title: { type: "string", minLength: 3 },
		content: { type: "string", minLength: 1 },
		category_id: { type: "string", required: false },
		tags: { type: "array", required: false }
	}),
	postController.createPost
);
router.get(
	"/",
	validateQuery({
		page: { type: "number", required: false },
		limit: { type: "number", required: false },
		category_id: { type: "string", required: false },
		user_id: { type: "string", required: false },
		search: { type: "string", required: false },
		sortBy: { type: "string", required: false },
		order: { type: "string", required: false, enum: ["asc", "desc"] }
	}),
	postController.getAllPosts
);
router.get(
	"/:id",
	validateParams({
		id: { type: "uuid" }
	}),
	postController.getPostById
);
router.put(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		title: { type: "string", required: false, minLength: 3 },
		content: { type: "string", required: false, minLength: 1 },
		category_id: { type: "string", required: false },
		tags: { type: "array", required: false }
	}),
	postController.updatePost
);
router.delete(
	"/:id",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	postController.deletePost
);
router.post(
	"/:id/like",
	requireAuth,
	validateParams({
		id: { type: "uuid" }
	}),
	postController.toggleLike
);

export default router;
