import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { FaHeart, FaUser, FaBookOpen, FaBars, FaTimes } from "react-icons/fa";
import { RiEBike2Fill } from "react-icons/ri";
import { authStore } from "@/store/authStore";
import { eventSourceRef } from "../../utills/eventSourceRef";

function Header() {
  const { isAuthenticated, clearAuth, getUserRole } = authStore();
  const userName = authStore((state) => state.userName);
  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem("auth-info");
    // SSE 연결 종료하기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <NavLink to="/">배민PC</NavLink>
        </div>

        <div className="user-menu">
          {isAuthenticated() ? (
            <>
              <span>{userName}님, 안녕하세요.</span>
              <button className="btn btn-round" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-round">
              로그인
            </NavLink>
          )}
        </div>
      </div>

      <nav className="nav">
        {isAuthenticated() && getUserRole() === "ROLE_ADMIN" ? (
          <NavLink to="/admin">관리자 페이지</NavLink>
        ) : (
          <>
            <NavLink to="/order/status">
              <RiEBike2Fill /> 주문 현황
            </NavLink>
            <NavLink to="/favorite">
              <FaHeart /> 찜
            </NavLink>
            <NavLink to="/mypage">
              <FaUser /> 마이페이지
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
