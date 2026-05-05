import rateLimit from "express-rate-limit";

const buildLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later."
    },
    ...options
  });

const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10
});

const resetPasswordLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5
});

const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300
});

export { loginLimiter, resetPasswordLimiter, apiLimiter };
