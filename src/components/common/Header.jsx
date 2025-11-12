import React from "react";
import { NavLink, useNavigate } from "react-router";
import { FaHeart, FaUser, FaStore } from "react-icons/fa";
import { RiEBike2Fill, RiAdminFill } from "react-icons/ri";
import { authStore } from "@/store/authStore";

const MENU_ITEMS = [
  {
    to: "/store",
    label: "가게",
    Icon: FaStore,
    roles: ["ROLE_USER", "ROLE_OWNER", "ROLE_ADMIN"],
  },
  {
    to: "/favorite",
    label: "찜",
    Icon: FaHeart,
    roles: ["ROLE_USER", "ROLE_OWNER", "ROLE_ADMIN"],
  },
  {
    to: "/order/status",
    label: "주문 현황",
    Icon: RiEBike2Fill,
    roles: ["ROLE_USER"],
  },
  {
    to: "/mypage",
    label: "마이페이지",
    Icon: FaUser,
    roles: ["ROLE_USER", "ROLE_OWNER"],
  },
  {
    to: "/admin",
    label: "관리자 페이지",
    Icon: RiAdminFill,
    roles: ["ROLE_ADMIN"],
  },
];

export default function Header() {
  const { isAuthenticated, clearAuth, getUserRole } = authStore();
  const userName = authStore((state) => state.userName);
  const navigate = useNavigate();

  /** 로그아웃 처리 */
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const role = getUserRole();
  const visibleMenus = MENU_ITEMS.filter((menu) => menu.roles.includes(role));

  return (
    <header className="header">
      <div className="header-inner">
        {/* 로고 */}
        <div className="logo">
          <NavLink to="/">배민PC</NavLink>
        </div>

        {/* 사용자 메뉴 */}
        <div className="user-menu">
          {isAuthenticated() ? (
            <>
              <span className="user-name">{userName}님, 안녕하세요.</span>
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

      {/* 네비게이션 (로그인 상태일 때만 표시) */}
      {isAuthenticated() && (
        <nav className="nav">
          {visibleMenus.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon aria-hidden="true" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
