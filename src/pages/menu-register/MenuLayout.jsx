import React, { useEffect } from "react";
import styles from "./MenuLayout.module.scss";
import CategoryPanel from "./CategoryPanel";
import MenuPanel from "./MenuPanel";
import { IoClose } from "react-icons/io5";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useMenuCategory } from "@/hooks/menu/useMenuCategory";

export default function MenuLayout() {
  const storeId = 5; // 추후 실제 storeId 연동 예정
  const { categories } = useMenuCategory(storeId); // React Query에서 실시간 데이터 가져옴
  const { activeCategory, clearActiveCategory } = useCategoryStore();

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
        <button type="button" className={styles.close}>
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
