import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const initialToken = localStorage.getItem("token") || null;
  const rawUser = localStorage.getItem("user");
  const initialUser = rawUser ? JSON.parse(rawUser) : null;

  const [auth, setAuth] = useState({
    token: initialToken,
    user: initialUser,
    loading: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("token", auth.token);
    } else {
      localStorage.removeItem("token");
    }

    if (auth.user) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("user");
    }

    const publicPaths = ["/login", "/register", "/"];
    if (auth.token && auth.user) {
      if (publicPaths.includes(location.pathname)) {
        navigate("/home");
      }
    } else {
      if (!publicPaths.includes(location.pathname)) {
        navigate("/login");
      }
    }
  }, [auth, location.pathname, navigate]);

  const login = async (email, password) => {
    setAuth((p) => ({ ...p, loading: true }));
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;
      if (data?.success && data.data?.token) {
        setAuth({
          token: data.data.token,
          user: data.data.user || null,
          loading: false,
        });
        return { success: true };
      }
      setAuth((p) => ({ ...p, loading: false }));
      return { success: false, message: data?.message || "Login failed" };
    } catch (err) {
      setAuth((p) => ({ ...p, loading: false }));
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null, loading: false });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        loading: auth.loading,
        login,
        logout,
        isAuthenticated: !!auth.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
