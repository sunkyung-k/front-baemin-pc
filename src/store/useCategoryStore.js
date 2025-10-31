import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * 전역 UI 상태 (현재 선택된 카테고리)
 * React Query는 서버 데이터 관리, Zustand는 UI 제어 전용
 */
export const useCategoryStore = create(
  devtools((set) => ({
    activeCategory: null,
    setActiveCategory: (category) => set({ activeCategory: category }),
    clearActiveCategory: () => set({ activeCategory: null }),
  }))
);
