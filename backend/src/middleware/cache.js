const cacheStore = new Map();

const getCacheEntry = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

const setCacheEntry = (key, value, ttlMs) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
};

const cacheResponse = (ttlMs, getKey) => (req, res, next) => {
  const key = getKey ? getKey(req) : req.originalUrl;
  const cached = getCacheEntry(key);

  if (cached) {
    return res.status(200).json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setCacheEntry(key, payload, ttlMs);
    }
    return originalJson(payload);
  };

  return next();
};

export { cacheResponse };
