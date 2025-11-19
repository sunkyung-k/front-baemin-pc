import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { authStore } from "@/store/authStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import AddressInput from "@/components/form/AddressInput";
import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import useAccount from "@/hooks/useAccount";

/** ROLE 별 메뉴 정의 */
const MENU_BY_ROLE = {
  ROLE_ADMIN: [
    { label: "회원 관리", to: "/admin/user", activeMatch: ["/admin/user"] },
    {
      label: "가게 관리",
      to: "/admin/store",
      activeMatch: ["/admin/store", "/store/"],
    },
  ],
  ROLE_USER: [
    { label: "가게", to: "/store", activeMatch: ["/store"] },
    { label: "찜", to: "/favorite", activeMatch: ["/favorite"] },
    { label: "주문 현황", to: "/order/status", activeMatch: ["/order/status"] },
    { label: "마이페이지", to: "/mypage", activeMatch: ["/mypage"] },
  ],
  ROLE_OWNER: [
    { label: "가게", to: "/store", activeMatch: ["/store"] },
    { label: "찜", to: "/favorite", activeMatch: ["/favorite"] },
    { label: "마이페이지", to: "/mypage", activeMatch: ["/mypage"] },
  ],
  GUEST: [
    { label: "가게", to: "/store", activeMatch: ["/store"] },
    { label: "찜", to: "/favorite", activeMatch: ["/favorite"] },
    { label: "주문 현황", to: "/order/status", activeMatch: ["/order/status"] },
    { label: "마이페이지", to: "/mypage", activeMatch: ["/mypage"] },
  ],
};

function getMenus(role) {
  return MENU_BY_ROLE[role] || MENU_BY_ROLE.GUEST;
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  /** Zustand 값 */
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const clearAuth = authStore((s) => s.clearAuth);
  const getUserRole = authStore((s) => s.getUserRole);

  /** React Query 기반 최신 유저 정보 */
  const { userInfo } = useAccount();

  const role = getUserRole() || "GUEST";
  const visibleMenus = getMenus(role);

  /** 주소 상태 */
  const address = useAddressStore((s) => s.address);
  const setAddress = useAddressStore((s) => s.setAddress);
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch();

  const [menuOpen, setMenuOpen] = useState(false);

  const isStoreListPage = location.pathname === "/store";
  const isFavoritePage = location.pathname === "/favorite";

  const showAddressInput =
    role !== "ROLE_ADMIN" && (isStoreListPage || isFavoritePage);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleNeedLogin = () => {
    if (confirm("로그인이 필요한 기능입니다. 로그인 하시겠습니까?")) {
      navigate("/login");
    }
  };

  const handleMenuClick = (e) => {
    setMenuOpen(false);
    if (role === "GUEST") {
      e.preventDefault();
      handleNeedLogin();
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="left-wrap">
          <div className="logo">
            <NavLink to="/">
              <img src="/bmpc.png" alt="배민PC 로고" />
            </NavLink>
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

        <aside className={`aside ${menuOpen ? "open" : ""}`}>
          <button
            className="aside-close-btn"
            onClick={() => setMenuOpen(false)}
          >
            <IoClose />
          </button>

          <div className="aside-inner">
            <nav className="nav">
              {visibleMenus.map((item, idx) => {
                const isCustomActive =
                  item.activeMatch &&
                  item.activeMatch.some((pattern) =>
                    location.pathname.startsWith(pattern)
                  );

                return (
                  <NavLink
                    key={`${item.to}-${idx}`}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link ${isActive || isCustomActive ? "active" : ""}`
                    }
                    onClick={handleMenuClick}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="user-menu">
              {isAuthenticated && userInfo?.userName ? (
                <>
                  <span className="user-name">
                    {userInfo.userName}님 안녕하세요.
                  </span>
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
