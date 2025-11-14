import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "@/store/authStore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const isAuthenticated = authStore((s) => s.isAuthenticated)();
  const role = authStore((s) => s.getUserRole)();
  const location = useLocation();

  // allowedRoles가 없으면 → 공개 페이지이기 때문에 아무 조건 없이 통과해야 함
  if (!allowedRoles) return children;

  // allowedRoles가 있는데 로그인이 안 되어있다면
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 로그인은 했지만 role이 안 맞는 경우
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
