import React from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "@/store/authStore";
import styles from "./FloatingStoreRegisterBtn.module.scss";
import { FaStore } from "react-icons/fa6";

export default function FloatingStoreRegisterBtn() {
  const navigate = useNavigate();
  const { storeId, userRole } = authStore();

  const isOwner = userRole === "ROLE_OWNER";
  const hasStore = !!storeId;

  if (!isOwner || hasStore) return null; // 🔥 점주 + 미등록 상태만 표시

  return (
    <button
      className={styles.floatingBtn}
      onClick={() => navigate("/mypage/store")}
    >
      <FaStore size={18} />
      <span>지금 바로 가게 등록!</span>
    </button>
  );
}
