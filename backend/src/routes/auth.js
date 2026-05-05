import express from "express";
import { authController } from "../controllers/index.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { loginLimiter, resetPasswordLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post(
	"/register",
	validateBody({
		email: { type: "email" },
		password: { type: "string", minLength: 6 },
		username: { type: "string" },
		full_name: { type: "string", required: false }
	}),
	authController.register
);
router.post(
	"/login",
	loginLimiter,
	validateBody({
		email: { type: "email" },
		password: { type: "string" }
	}),
	authController.login
);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.getCurrentUser);
router.post(
	"/reset-password",
	resetPasswordLimiter,
	validateBody({
		email: { type: "email" }
	}),
	authController.resetPassword
);
router.put(
	"/update-password",
	requireAuth,
	validateBody({
		password: { type: "string", minLength: 6 }
	}),
	authController.updatePassword
);

export default router;
