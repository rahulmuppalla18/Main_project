// frontend/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { token } = useAuth();

  // If no token → not logged in → send to login page
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
