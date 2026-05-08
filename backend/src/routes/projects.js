import express from "express";
import { listProjects, createProject, recordPayment } from "../controllers/projectController.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateBody, validateParams } from "../middleware/validate.js";

const router = express.Router();

router.get("/", requireAuth, listProjects);

router.post(
  "/",
  requireAuth,
  validateBody({
    client: { type: "string" },
    project: { type: "string" },
    totalAmount: { type: "number" },
    paidAmount: { type: "number" },
    date: { type: "date" },
    type: { type: "string" },
    notes: { type: "string", required: false }
  }),
  createProject
);

router.post(
  "/:id/payments",
  requireAuth,
  validateParams({
    id: { type: "string" }
  }),
  validateBody({
    amount: { type: "number" },
    type: { type: "string" },
    notes: { type: "string", required: false }
  }),
  recordPayment
);

export default router;
