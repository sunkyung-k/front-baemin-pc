import React, { useEffect, useState } from "react";
import { authStore } from "@/store/authStore";
import { fetchMyStore } from "@/service/storeAPI"; // [수정] 내 가게 불러오기 API
import styles from "./MypageMenu.module.scss";

function MypageMenu() {
  const { userName } = authStore();
  const [storeName, setStoreName] = useState("등록된 가게 없음"); // [수정] 초기값
  const [isEdit, setIsEdit] = useState(false); // [수정] 등록 vs 수정 구분

  // ✅ [수정] 로그인된 유저의 가게 불러오기
  useEffect(() => {
    const loadMyStore = async () => {
      try {
        const myStore = await fetchMyStore();
        if (myStore) {
          setStoreName(myStore.storeName || "미등록");
          setIsEdit(true);
        }
      } catch (err) {
        console.warn("가게 정보 없음 → 등록모드 유지");
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

        {/* [수정] 버튼 텍스트 자동 변경 */}
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
