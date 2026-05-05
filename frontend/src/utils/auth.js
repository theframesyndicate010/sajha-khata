import { fetchJson, getToken, setToken } from "./apiClient";

const USER_KEY = "software_khata_user";

const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const login = async (email, password) => {
  const response = await fetchJson("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  const session = response?.data?.session;
  const token = session?.access_token;
  const profile = response?.data?.profile;
  const user = response?.data?.user;
  const payload = profile || user || null;

  setToken(token);
  setUser(payload);

  return payload;
};

export const logout = async () => {
  try {
    await fetchJson("/auth/logout", { method: "POST", withAuth: true });
  } finally {
    setToken(null);
    setUser(null);
  }
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};
