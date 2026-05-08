const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isEmail = (value) => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const isUuid = (value) =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isDateOnly = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isNumberLike = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number.isFinite(Number(value));
  }
  return false;
};

const validatePayload = (payload, rules, res, next) => {
  const errors = [];

  Object.entries(rules).forEach(([field, rule]) => {
    const { type, required = true, minLength, minItems, enum: allowedValues, pattern } = rule;
    const value = payload[field];

    if (value === undefined || value === null) {
      if (required) {
        errors.push(`${field} is required`);
      }
      return;
    }

    // For optional fields, treat empty string as not provided.
    if (!required && typeof value === "string" && value.trim() === "") {
      return;
    }

    if (type === "string" && !isNonEmptyString(value)) {
      errors.push(`${field} must be a non-empty string`);
      return;
    }

    if (type === "email" && !isEmail(value)) {
      errors.push(`${field} must be a valid email address`);
      return;
    }

    if (type === "uuid" && !isUuid(value)) {
      errors.push(`${field} must be a valid UUID`);
      return;
    }

    if (type === "date" && !isDateOnly(value)) {
      errors.push(`${field} must be a valid date (YYYY-MM-DD)`);
      return;
    }

    if (type === "number" && !isNumberLike(value)) {
      errors.push(`${field} must be a valid number`);
      return;
    }

    if (type === "array" && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
      return;
    }

    if (type === "array" && typeof minItems === "number" && value.length < minItems) {
      errors.push(`${field} must have at least ${minItems} items`);
    }

    if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
      errors.push(`${field} must be one of: ${allowedValues.join(", ")}`);
      return;
    }

    if (pattern instanceof RegExp && typeof value === "string" && !pattern.test(value)) {
      errors.push(`${field} is not in the expected format`);
    }

    if (typeof minLength === "number" && typeof value === "string" && value.length < minLength) {
      errors.push(`${field} must be at least ${minLength} characters`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  return next();
};

const validateBody = (rules) => (req, res, next) => {
  const payload = req.body || {};
  return validatePayload(payload, rules, res, next);
};

const validateQuery = (rules) => (req, res, next) => {
  const payload = req.query || {};
  return validatePayload(payload, rules, res, next);
};

const validateParams = (rules) => (req, res, next) => {
  const payload = req.params || {};
  return validatePayload(payload, rules, res, next);
};

export { validateBody, validateQuery, validateParams };
