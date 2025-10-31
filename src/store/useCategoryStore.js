import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * 전역 카테고리 상태 관리 (Zustand)
 * - activeCategory: 현재 선택된 카테고리 (MenuPanel에서 메뉴 표시용)
 */
export const useCategoryStore = create(
  devtools((set) => ({
    activeCategory: null,
    setActiveCategory: (category) => set({ activeCategory: category }),
    clearActiveCategory: () => set({ activeCategory: null }),
  }))
);
