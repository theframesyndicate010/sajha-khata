const nowIso = () => new Date().toISOString();

const toDateOnly = (value) => {
  if (value) {
    return value;
  }
  return new Date().toISOString().split("T")[0];
};

const sumAmounts = (rows) => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePagination = (pageValue, limitValue, maxLimit = 100) => {
  const page = Math.max(1, parseInt(pageValue, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(limitValue, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const stripUndefined = (payload) => {
  const cleaned = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

const errorPayload = (message, error) => {
  const payload = { success: false, message };
  if (process.env.NODE_ENV === "development" && error) {
    payload.error = error.message || String(error);
  }
  return payload;
};

export {
  nowIso,
  toDateOnly,
  sumAmounts,
  parseNumber,
  parsePagination,
  stripUndefined,
  errorPayload
};
