import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authStore } from "@/store/authStore";
import MypageMenu from "./MypageMenu";
import styles from "./MypageLayout.module.scss";

function MypageLayout() {
  const { userRole } = authStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 기본 진입(/mypage)일 때만 역할별 페이지로 이동
    if (location.pathname === "/mypage") {
      if (userRole === "ROLE_OWNER") {
        navigate("/mypage/order/manage", { replace: true });
      } else if (userRole === "ROLE_USER") {
        navigate("/mypage/order/info", { replace: true });
      }
    }
  }, [userRole, location.pathname, navigate]);

  return (
    <div className={styles.mypage}>
      <MypageMenu />
      <div className={styles.contents}>
        <Outlet />
      </div>
    </div>
  );
}

export default MypageLayout;
