// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // load saved user/token from localStorage on startup
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ls_user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("ls_token") || null);
  const [loading, setLoading] = useState(false);

  // apply token to API header on mount/token change
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // global listener: if backend sends 401 -> auto logout
  useEffect(() => {
    const onUnauth = () => {
      logout();
    };
    window.addEventListener("app:unauthorized", onUnauth);
    return () => window.removeEventListener("app:unauthorized", onUnauth);
  }, []);

  // LOGIN
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      const t = data.token || data.accessToken;
      const u = data.user || data;

      if (t) {
        localStorage.setItem("ls_token", t);
        setToken(t);
        setAuthToken(t);
      }

      if (u) {
        localStorage.setItem("ls_user", JSON.stringify(u));
        setUser(u);
      }

      setLoading(false);
      return { ok: true, data };

    } catch (err) {
      setLoading(false);
      return {
        ok: false,
        error: err?.response?.data?.message || err.message || "Login failed"
      };
    }
  };

  // SIGNUP
  const signup = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", payload);
      const data = res.data;

      const t = data.token || data.accessToken;
      const u = data.user || data;

      if (t) {
        localStorage.setItem("ls_token", t);
        setToken(t);
        setAuthToken(t);
      }

      if (u) {
        localStorage.setItem("ls_user", JSON.stringify(u));
        setUser(u);
      }

      setLoading(false);
      return { ok: true, data };

    } catch (err) {
      setLoading(false);
      return {
        ok: false,
        error: err?.response?.data?.message || err.message || "Signup failed"
      };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("ls_token");
    localStorage.removeItem("ls_user");
    setToken(null);
    setUser(null);
    setAuthToken(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
