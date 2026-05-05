import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import supabase from "./config/config.js";
import apiRoutes from "./routes/api.js";
import { apiLimiter } from "./middleware/rateLimiters.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [];

app.use(helmet());

const corsOrigin = allowedOrigins.length
  ? allowedOrigins
  : (origin, callback) => callback(new Error("Not allowed by CORS"));

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "200kb" }));

// Make supabase available to all routes
app.locals.supabase = supabase;

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Sajha Khata API Server is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API routes
app.use("/api", apiLimiter, apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked"
    });
  }

  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

export default app;
