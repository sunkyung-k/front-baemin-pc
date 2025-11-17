import React, { useEffect } from "react";
import styles from "./MenuLayout.module.scss";
import CategoryPanel from "./CategoryPanel";
import MenuPanel from "./MenuPanel";
import { IoClose } from "react-icons/io5";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useMenuCategory } from "@/hooks/menu/useMenuCategory";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function MenuLayout() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // storeId가 없을 경우 마이페이지로 리다이렉트
  useEffect(() => {
    if (!storeId) navigate("/mypage");
  }, [storeId, navigate]);

  // storeId 기반 메뉴 카테고리 조회
  const { categories, isLoading } = useMenuCategory(storeId);
  const { activeCategory, clearActiveCategory } = useMenuCategoryStore();

  // 닫기 버튼 동작
  const handleClose = () => {
    if (location.state?.from === "mypage") {
      navigate("/mypage");
    } else if (location.state?.from === "store") {
      navigate(`/store/${storeId}`);
    } else {
      navigate(-1);
    }
  };

  // 카테고리 삭제된 경우 활성 카테고리 초기화
  useEffect(() => {
    if (isLoading) return; // 🔹 내부에서 처리만, return 문으로 Hook 자체를 끊지 않음
    if (!activeCategory) return;

    const stillExists = categories?.some(
      (cat) => cat.menuCaId === activeCategory.menuCaId
    );

    if (!stillExists && activeCategory !== null) {
      clearActiveCategory();
    }
  }, [categories, activeCategory, clearActiveCategory, isLoading]);

  // 언마운트 시 전체 상태 정리
  useEffect(() => {
    return () => {
      clearActiveCategory();
    };
  }, [clearActiveCategory]);

  return (
    <div className={styles.wrap}>
      <main className={styles.main}>
        <button
          type="button"
          className={`${styles.close} btn btn-default btn-sm btn-primary`}
          onClick={handleClose}
        >
          나가기
        </button>
        <div className={styles.panelWrapper}>
          <CategoryPanel storeId={storeId} />
          <MenuPanel />
        </div>
      </main>
    </div>
  );
}
