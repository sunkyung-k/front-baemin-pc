import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * 가게 관리 전역 상태
 * React Query는 서버 데이터 관리
 * Zustand는 UI 제어 / 현재 가게 상태 캐싱 전용
 */
export const useStoreInfoStore = create(
  devtools((set) => ({
    myStore: null,
    setMyStore: (store) => set({ myStore: store }),
    clearMyStore: () => set({ myStore: null }),
  }))
);
