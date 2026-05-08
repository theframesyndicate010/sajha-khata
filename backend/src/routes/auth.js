import express from "express";
import { login, logout } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/login",
  loginLimiter,
  validateBody({
    email: { type: "email" },
    password: { type: "string", minLength: 6 }
  }),
  login
);

router.post("/logout", requireAuth, logout);

export default router;
