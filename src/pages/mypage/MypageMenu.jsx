import React from "react";
import { NavLink } from "react-router-dom";
import { authStore } from "@/store/authStore";
import { useStore } from "@/hooks/useStore";
import MypageProfile from "./MypageProfile";
import styles from "./MypageMenu.module.scss";

function MypageMenu() {
  const { userId, userName, userRole } = authStore();
  const { myStore, isLoading } = useStore();

  const storeName = myStore?.storeName || "등록된 가게 없음";
  const isEdit = !!myStore;

  const menuItems =
    userRole === "ROLE_OWNER"
      ? [
          { to: "/mypage/order/manage", label: "주문 관리" },
          {
            to: "/mypage/store",
            label: isEdit ? "가게 수정" : "가게 등록",
          },
          ...(myStore
            ? [{ to: `/menuRegister/${myStore.storeId}`, label: "메뉴 관리" }]
            : []),
          { to: "/mypage/account", label: "계정 설정" },
        ]
      : [
          { to: "/mypage/order/info", label: "주문 정보" },
          { to: "/mypage/account", label: "계정 설정" },
        ];

  return (
    <aside className={styles.sidebar}>
      <MypageProfile
        userName={userName}
        userId={userId}
        userRole={userRole}
        storeName={isLoading ? "로딩 중..." : storeName}
      />

      <nav className={styles.navMenu}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default MypageMenu;
