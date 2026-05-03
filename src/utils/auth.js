const AUTH_KEY = "software_khata_auth";

// Single Admin Account
export const ADMIN_USER = { 
  id: "admin", 
  name: "Software Khata Admin", 
  role: "System Administrator", 
  email: "admin@frame-khata.com",
  avatar: "AD",
  color: "bg-blue-600"
};

export const login = (email, password) => {
  // Simple mock validation
  if (email === "admin@khata.com" && password === "admin123") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(ADMIN_USER));
    return ADMIN_USER;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_KEY);
};
