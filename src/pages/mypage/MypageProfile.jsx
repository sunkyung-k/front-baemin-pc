import React, { useState } from "react";
import { authStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/useStore";
import useAccount from "@/hooks/useAccount";
import PointChargeModal from "../../components/common/PointChargeModal";
import styles from "./MypageProfile.module.scss";
import { formatPrice } from "@/utills/valueFormatter";

export default function MypageProfile() {
  const navigate = useNavigate();
  const { userName, userId, userRole } = authStore();
  const { myStore } = useStore();
  const { userInfo, isUserInfoLoading } = useAccount();
  const [isChargeOpen, setChargeOpen] = useState(false);

  /** 가게명 표시 */
  const storeName = myStore?.storeName || "등록된 가게 없음";

  /**  내 가게로 이동 */
  const handleGoMyStore = () => {
    if (!myStore || !myStore.storeId) {
      alert("등록된 가게가 없습니다.");
      return;
    }
    navigate(`/store/${myStore.storeId}`);
  };

  /** 보유 포인트 표시 */
  const deposit = isUserInfoLoading
    ? "로딩 중..."
    : userInfo?.deposit
    ? `₩${formatPrice(userInfo.deposit)}`
    : "₩0";

  const roleInfo = {
    ROLE_OWNER: {
      labelTxt: "가게명:",
      label: storeName,
      subText: "총 수입",
      value: "₩1,203,000",
      button: (
        <button
          type="button"
          className="btn btn-round btn-primary"
          onClick={handleGoMyStore}
        >
          내 가게 보기
        </button>
      ),
    },
    ROLE_USER: {
      labelTxt: "ID:",
      label: userId,
      subText: "보유 포인트",
      value: deposit,
      button: (
        <button
          type="button"
          className="btn btn-round btn-primary"
          onClick={() => setChargeOpen(true)}
        >
          포인트 충전
        </button>
      ),
    },
  };

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
      <div className={styles.income}>
        {info.subText} : {info.value}
      </div>
      <div>{info.button}</div>

      {/* 포인트 충전 모달 */}
      <PointChargeModal
        isOpen={isChargeOpen}
        onClose={() => setChargeOpen(false)}
      />
    </div>
  );
}
