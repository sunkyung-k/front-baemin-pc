import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * 전역 UI 상태 (현재 선택된 카테고리)
 * React Query는 서버 데이터 관리, Zustand는 UI 제어 전용
 * 메뉴 등록/삭제 시 즉시 반영되도록 항상 새 객체로 교체
 */
export const useCategoryStore = create(
  devtools((set, get) => ({
    activeCategory: null,

    /** 카테고리 선택 (항상 새 객체로 세팅) */
    setActiveCategory: (category) => {
      if (!category) {
        set({ activeCategory: null });
        return;
      }

      const current = get().activeCategory;

      // menuCaId는 같더라도 menuList가 바뀌었을 수 있음 → 항상 새 객체로 교체
      const isSameCategory = current?.menuCaId === category?.menuCaId;

      // 동일 카테고리여도 참조 새로 만들어 React 리렌더 트리거
      set({
        activeCategory: isSameCategory ? { ...category } : { ...category },
      });
    },

    /** 카테고리 초기화 */
    clearActiveCategory: () => {
      set({ activeCategory: null });
    },
  }))
);
