import React from "react";
import { authStore } from "@/store/authStore";
import { useStore } from "@/hooks/useStore";
import styles from "./MypageProfile.module.scss";

export default function MypageProfile() {
  // 로그인 유저 기본 정보 (Zustand)
  const { userName, userId, userRole } = authStore();

  // 점주(OWNER)일 경우 React Query 캐시 기반으로 내 가게 정보 조회
  const { myStore, isLoading } = useStore();

  // React Query에서 가져온 가게명 (로딩/미등록 상태 구분)
  const storeName = isLoading
    ? "로딩 중..."
    : myStore?.storeName || "등록된 가게 없음";

  const roleInfo = {
    ROLE_OWNER: {
      labelTxt: "가게명:",
      label: storeName,
      subText: "총 수입",
      value: "₩1,203,000",
      button: null,
    },
    ROLE_USER: {
      labelTxt: "ID:",
      label: userId,
      subText: "보유 포인트",
      value: "₩1,203,000",
      button: (
        <div>
          <button type="button" className="btn btn-round btn-primary">
            포인트 충전
          </button>
        </div>
      ),
    },
  };

  // 현재 로그인된 역할에 맞는 표시 정보 선택
  const info = roleInfo[userRole] || {};

  return (
    <div className={styles.profile}>
      <strong className={styles.pName}>{userName}님</strong>
      {info.label && (
        <p className={styles.pId}>
          <span>{info.labelTxt}</span>
          <span>{info.label}</span>
        </p>
      )}
      {info.button}
      <div className={styles.income}>
        {info.subText} : {info.value}
      </div>
    </div>
  );
}
