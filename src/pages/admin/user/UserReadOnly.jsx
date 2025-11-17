import React from "react";
import styles from "./UserReadOnly.module.scss";

export default function UserReadOnly({ vo }) {
  if (!vo) return null;

  return (
    <div className={styles.readOnlyBox}>
      <p>회원 정보</p>

      <div className={styles.roGrid}>
        <div>
          <span>구분</span>
          <strong>{vo.roleName || "관리자"}</strong>
        </div>

        {vo.userRole === "OWNER" && (
          <div>
            <span>가게 정보</span>
            <strong>
              {vo.storeId && vo.storeName
                ? `${vo.storeName} (storeId: ${vo.storeId})`
                : "등록된 가게 없음"}
            </strong>
          </div>
        )}

        {vo.userRole !== "ADMIN" && (
          <div>
            <span>{vo.userRole === "OWNER" ? "수입" : "포인트"}</span>
            <strong>
              {vo.userRole === "OWNER"
                ? `${Number(vo.balance).toLocaleString()}원`
                : `${Number(vo.deposit).toLocaleString()}원`}
            </strong>
          </div>
        )}

        <div>
          <span>생성일</span>
          <strong>{vo.createDate}</strong>
        </div>

        <div>
          <span>수정일</span>
          <strong>{vo.updateDate}</strong>
        </div>
      </div>
    </div>
  );
}
