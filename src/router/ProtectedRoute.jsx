import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "@/store/authStore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const isAuthenticated = authStore((s) => s.isAuthenticated)();
  const role = authStore((s) => s.getUserRole)();
  const location = useLocation();

  // ADMIN이 "/" 접근하면 admin 전용 페이지로 이동
  if (role === "ROLE_ADMIN" && location.pathname === "/") {
    return <Navigate to="/admin/user" replace />;
  }

  // allowedRoles가 없으면 → 공개 페이지
  if (!allowedRoles) return children;

  // 로그인 안 되어있다면
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // role이 안 맞는 경우
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
