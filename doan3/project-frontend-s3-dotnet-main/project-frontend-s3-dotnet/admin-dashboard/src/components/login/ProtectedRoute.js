import React from "react";
import { Navigate } from "react-router-dom";

// ProtectedRoute component to check if the user is authenticated
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));

    const expirationTime = new Date(payload.exp * 1000);
    console.log("Token expires at:", expirationTime.toLocaleString());

    const currentTime = Date.now() / 1000;
    if (payload.exp < currentTime) {
      localStorage.clear();
      return <Navigate to="/login" />;
    }
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
