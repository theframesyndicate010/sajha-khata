import express from "express";
import { categoryController } from "../controllers/index.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";
import { cacheResponse } from "../middleware/cache.js";

const router = express.Router();

router.get(
	"/",
	validateQuery({
		page: { type: "number", required: false },
		limit: { type: "number", required: false },
		search: { type: "string", required: false }
	}),
	cacheResponse(60 * 1000),
	categoryController.getAllCategories
);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get(
	"/:id",
	validateParams({
		id: { type: "uuid" }
	}),
	categoryController.getCategoryById
);
router.post(
	"/",
	validateBody({
		name: { type: "string", minLength: 2 },
		slug: { type: "string", minLength: 2 },
		description: { type: "string", required: false },
		color: { type: "string", required: false }
	}),
	categoryController.createCategory
);
router.put(
	"/:id",
	validateParams({
		id: { type: "uuid" }
	}),
	validateBody({
		name: { type: "string", required: false, minLength: 2 },
		slug: { type: "string", required: false, minLength: 2 },
		description: { type: "string", required: false },
		color: { type: "string", required: false }
	}),
	categoryController.updateCategory
);
router.delete(
	"/:id",
	validateParams({
		id: { type: "uuid" }
	}),
	categoryController.deleteCategory
);
router.get(
	"/:categoryId/posts",
	validateParams({
		categoryId: { type: "uuid" }
	}),
	validateQuery({
		page: { type: "number", required: false },
		limit: { type: "number", required: false }
	}),
	cacheResponse(30 * 1000),
	categoryController.getPostsByCategory
);

export default router;
