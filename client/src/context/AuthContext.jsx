import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "ms-store-auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return savedAuth ? JSON.parse(savedAuth) : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [auth.token]);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);

    setAuth({
      user: res.data.user,
      token: res.data.token,
    });

    toast.success("Account created successfully");

    return res.data.user;
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);

    setAuth({
      user: res.data.user,
      token: res.data.token,
    });

    toast.success("Logged in successfully");

    return res.data.user;
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.success("Logged out");
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.user && auth.token),
      isAdmin: auth.user?.role === "admin",
      register,
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}