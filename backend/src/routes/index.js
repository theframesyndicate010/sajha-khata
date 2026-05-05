import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import postRoutes from "./posts.js";
import categoryRoutes from "./categories.js";
import projectRoutes from "./projects.js";
import expenseRoutes from "./expenses.js";
import profitRoutes from "./profits.js";
import summaryRoutes from "./summary.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/projects", projectRoutes);
router.use("/expenses", expenseRoutes);
router.use("/profits", profitRoutes);
router.use("/summary", summaryRoutes);

export default router;
