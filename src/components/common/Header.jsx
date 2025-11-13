import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { authStore } from "@/store/authStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import AddressInput from "@/components/form/AddressInput";
import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const MENU_ITEMS = [
  {
    to: "/store",
    label: "가게",
    roles: ["ROLE_USER", "ROLE_OWNER", "ROLE_ADMIN"],
  },
  {
    to: "/favorite",
    label: "찜",
    roles: ["ROLE_USER", "ROLE_OWNER", "ROLE_ADMIN"],
  },
  { to: "/order/status", label: "주문 현황", roles: ["ROLE_USER"] },
  { to: "/mypage", label: "마이페이지", roles: ["ROLE_USER", "ROLE_OWNER"] },
  { to: "/admin", label: "관리자 페이지", roles: ["ROLE_ADMIN"] },
];

export default function Header() {
  const { isAuthenticated, clearAuth, getUserRole } = authStore();
  const userName = authStore((state) => state.userName);
  const navigate = useNavigate();
  const location = useLocation();

  const address = useAddressStore((state) => state.address);
  const setAddress = useAddressStore((state) => state.setAddress);

  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    setMenuOpen(false);
  };

  const role = getUserRole();
  const visibleMenus = MENU_ITEMS.filter((x) => x.roles.includes(role));

  const isStoreListPage = location.pathname === "/store";
  const isFavoritePage = location.pathname.startsWith("/favorite");

  const showAddressInput = isStoreListPage || isFavoritePage;

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

        <aside className={`aside ${menuOpen ? "open" : ""}`}>
          <button
            className="aside-close-btn"
            onClick={() => setMenuOpen(false)}
          >
            <IoClose />
          </button>

          <div className="aside-inner">
            {/* GNB */}
            {isAuthenticated() && (
              <nav className="nav">
                {visibleMenus.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}

            <div className="user-menu">
              {isAuthenticated() ? (
                <>
                  <span className="user-name">{userName}님, 안녕하세요.</span>
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
