import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 주소 전역 상태 (Zustand + persist)
 * - Kakao(GPS) / Daum(주소검색) 결과를 공통으로 저장
 * - localStorage에 자동 저장 → 새로고침해도 유지됨
 */
export const useAddressStore = create(
  persist(
    (set) => ({
      address: "",
      setAddress: (addr) => set({ address: addr }),
      clearAddress: () => set({ address: "" }),
    }),
    {
      name: "user-address", // localStorage 키 이름
      getStorage: () => localStorage,
    }
  )
);
