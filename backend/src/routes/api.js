import express from "express";
import authRoutes from "./auth.js";
import expenseRoutes from "./expenses.js";
import projectRoutes from "./projects.js";
import profitRoutes from "./profits.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/projects", projectRoutes);
router.use("/profits", profitRoutes);

export default router;
