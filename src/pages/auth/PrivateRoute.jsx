import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token); //
    const currentTime = Date.now() / 1000; // en secondes

    if (decoded.exp < currentTime) {
      // Token expiré
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (error) {
    // Token cassé ou invalide
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
