import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { authStore } from "@/store/authStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import AddressInput from "@/components/form/AddressInput";
import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

/**
 * 메뉴 권한 규칙
 * ---------------------------------------------------------
 * visible: ["ROLE", "ROLE"...] 에 현재 role이 포함되면 메뉴 표시
 * GUEST는 userRole이 없는 상태 → role = "GUEST" 로 치환
 */
const MENU_ITEMS = [
  {
    to: "/store",
    label: "가게",
    visible: ["GUEST", "ROLE_USER", "ROLE_OWNER", "ROLE_ADMIN"],
  },
  {
    to: "/favorite",
    label: "찜",
    visible: ["GUEST", "ROLE_USER", "ROLE_OWNER"],
  },
  { to: "/order/status", label: "주문 현황", visible: ["GUEST", "ROLE_USER"] },

  // USER 전용 마이페이지
  {
    to: "/mypage/order/info",
    label: "마이페이지",
    visible: ["GUEST", "ROLE_USER"],
  },

  // OWNER 전용 마이페이지
  { to: "/mypage/order/manage", label: "마이페이지", visible: ["ROLE_OWNER"] },

  // ADMIN 전용
  { to: "/admin", label: "관리자 페이지", visible: ["ROLE_ADMIN"] },
];

export default function Header() {
  const { isAuthenticated, clearAuth, getUserRole } = authStore();
  const userName = authStore((s) => s.userName);
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 role (게스트는 userRole이 없음 → "GUEST") */
  const rawRole = getUserRole();
  const role = rawRole || "GUEST";

  /** 현재 role이 볼 수 있는 메뉴만 필터링 */
  const visibleMenus = MENU_ITEMS.filter((item) => item.visible.includes(role));

  const address = useAddressStore((s) => s.address);
  const setAddress = useAddressStore((s) => s.setAddress);

  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch();

  const [menuOpen, setMenuOpen] = useState(false);

  const isStoreListPage = location.pathname === "/store";
  const isFavoritePage = location.pathname === "/favorite";
  const showAddressInput = isStoreListPage || isFavoritePage;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    setMenuOpen(false);
  };

  /**
   * 메뉴 클릭 핸들러 (게스트는 로그인 필요 알럿)
   */
  const handleMenuClick = (e, to) => {
    setMenuOpen(false);

    // 게스트 → confirm 후 로그인 이동
    if (role === "GUEST") {
      e.preventDefault();
      if (confirm("로그인이 필요한 기능입니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="left-wrap">
          <div className="logo">
            <NavLink to="/">배민PC</NavLink>
          </div>

          {showAddressInput && (
            <div className="address-area">
              <AddressInput
                value={address}
                onGetLocation={async () => {
                  const result = await fetchAddress();
                  if (result) setAddress(result);
                }}
                onSearchAddress={() => openAddressSearch(setAddress)}
                loading={loading}
                variant="compact"
              />
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)}>
          <FaBars size={20} />
        </button>

        {/* 사이드 메뉴 */}
        <aside className={`aside ${menuOpen ? "open" : ""}`}>
          <button
            className="aside-close-btn"
            onClick={() => setMenuOpen(false)}
          >
            <IoClose />
          </button>

          <div className="aside-inner">
            {/* GNB */}
            <nav className="nav">
              {visibleMenus.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={(e) => handleMenuClick(e, to)}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* 로그인 / 로그아웃 */}
            <div className="user-menu">
              {isAuthenticated() ? (
                <>
                  <span className="user-name">{userName}님 안녕하세요.</span>
                  <button
                    className="btn btn-sm btn-round"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className="btn btn-sm btn-round"
                  onClick={() => setMenuOpen(false)}
                >
                  로그인
                </NavLink>
              )}
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
