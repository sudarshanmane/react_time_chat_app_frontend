import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

const ProtectedRoutes = ({ children }) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      logout();
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return children ;
};

export default ProtectedRoutes;
