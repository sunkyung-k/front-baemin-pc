import { create } from "zustand";

/**
 * 주소 전역 상태
 * Home, StoreList 둘 다 여기 주소 사용.
 * GPS/검색으로 주소 바꾸면 자동 동기화됨.
 * */
export const useAddressStore = create((set) => ({
  address: "",
  setAddress: (addr) => set({ address: addr }),
  clearAddress: () => set({ address: "" }),
}));
