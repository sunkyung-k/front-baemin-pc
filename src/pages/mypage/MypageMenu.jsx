import React, { useEffect, useState } from "react";
import { authStore } from "@/store/authStore";
import { fetchMyStore } from "@/service/storeAPI";

import styles from "./MypageMenu.module.scss";

function MypageMenu() {
  const { userName } = authStore();
  const [storeName, setStoreName] = useState("등록된 가게 없음");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const loadMyStore = async () => {
      try {
        const myStore = await fetchMyStore();
        if (myStore) {
          setStoreName(myStore.storeName || "미등록");
          setIsEdit(true);
        } else {
          setStoreName("등록된 가게 없음");
          setIsEdit(false);
        }
      } catch {
        // 불필요한 콘솔 제거
        setStoreName("로드 실패");
        setIsEdit(false);
      }
    };
    loadMyStore();
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <strong>{userName}님</strong>
        <span>가게명: {storeName}</span>
        <div className={styles.income}>총 수입 ₩1,203,000</div>
      </div>

      <nav className={styles.navMenu}>
        <a href="#" className={`${styles.navItem} ${styles.active}`}>
          주문 관리
        </a>
        <a href="/mypage/store" className={styles.navItem}>
          {isEdit ? "가게 수정" : "가게 등록"}
        </a>
        <a href="#" className={styles.navItem}>
          계정 설정
        </a>
      </nav>
    </aside>
  );
}

export default MypageMenu;
