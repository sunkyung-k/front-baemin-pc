import React, { useEffect } from "react";
import styles from "./MenuLayout.module.scss";
import CategoryPanel from "./CategoryPanel";
import MenuPanel from "./MenuPanel";
import { IoClose } from "react-icons/io5";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useMenuCategory } from "@/hooks/menu/useMenuCategory";
import { useNavigate, useParams } from "react-router-dom";

export default function MenuLayout() {
  /** 라우터 파라미터로 storeId 받기 */
  const { storeId } = useParams();
  const navigate = useNavigate();

  /** storeId가 없을 경우 마이페이지로 리다이렉트 (예외 처리) */
  useEffect(() => {
    if (!storeId) navigate("/mypage");
  }, [storeId, navigate]);

  /** storeId 기반으로 메뉴 카테고리 조회 */
  const { categories } = useMenuCategory(storeId);
  const { activeCategory, clearActiveCategory } = useMenuCategoryStore();

  /** 닫기 버튼 동작 */
  const handleClose = () => {
    // state.from 값에 따라 분기
    if (location.state?.from === "mypage") {
      navigate("/mypage");
    } else if (location.state?.from === "store") {
      navigate(`/store/${storeId}`);
    } else {
      navigate(-1); // 기본적으로는 이전 페이지로
    }
  };

  /** 카테고리 삭제된 경우 활성 카테고리 초기화 */
  useEffect(() => {
    // activeCategory 없으면 아무것도 안 함
    if (!activeCategory) return;

    const stillExists = categories?.some(
      (cat) => cat.menuCaId === activeCategory.menuCaId
    );

    // 카테고리가 삭제된 경우만 초기화
    if (!stillExists && activeCategory !== null) {
      clearActiveCategory();
    }
  }, [categories, activeCategory, clearActiveCategory]);

  /** 언마운트 시 전체 상태 정리 */
  useEffect(() => {
    return () => {
      clearActiveCategory(); // 언마운트 시 1회만 실행
    };
  }, [clearActiveCategory]);

  return (
    <div className={styles.wrap}>
      <main className={styles.main}>
        {/* 닫기 버튼 */}
        <button type="button" className={styles.close} onClick={handleClose}>
          <IoClose />
        </button>

        {/* 좌측: 카테고리 패널 / 우측: 메뉴 패널 */}
        <div className={styles.panelWrapper}>
          <CategoryPanel storeId={storeId} />
          <MenuPanel />
        </div>
      </main>
    </div>
  );
}
