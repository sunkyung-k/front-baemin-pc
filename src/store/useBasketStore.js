import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useBasketStore (Zustand)
 * ------------------------------------------------------
 * - 장바구니 전역 상태 (React Query + Zustand 병행 관리)
 * - React Query는 서버 데이터(fetch)
 * - Zustand는 로컬 UI 및 가게 단위 제어 담당
 * ------------------------------------------------------
 * 상태 구조
 * basket: API 응답 vo 전체 (basketId, totalPrice, itemList 등)
 * currentStoreId: 현재 장바구니에 담긴 가게 ID
 * alertOpen: 다른 가게 담기 시 모달/confirm 상태
 */
export const useBasketStore = create(
  devtools((set, get) => ({
    /** 장바구니 데이터 (서버 응답 vo) */
    basket: null,

    /** 현재 장바구니의 가게 ID */
    currentStoreId: null,

    /** 다른 가게 담기 시 모달/알림 상태 */
    alertOpen: false,

    /**
     * 장바구니 데이터 세팅
     * - React Query (useBasket)에서 getMyBasket 성공 시 호출
     * - itemList의 첫 menu 객체에서 storeId 추출 (있을 경우)
     */
    setBasket: (data) => {
      if (!data) {
        set({ basket: null, currentStoreId: null });
        return;
      }

      let storeId = null;
      if (Array.isArray(data.itemList) && data.itemList.length > 0) {
        const firstItem = data.itemList[0];
        storeId = firstItem?.menu?.storeId ?? null;
      }

      set({
        basket: { ...data },
        currentStoreId: storeId,
      });
    },

    /** 장바구니 전체 비우기 */
    clearBasket: () => {
      set({ basket: null, currentStoreId: null });
    },

    /** 특정 가게 ID 수동 세팅 (다른 가게 담을 때 사용) */
    setStoreId: (storeId) => {
      set({ currentStoreId: storeId });
    },

    /** 알림(모달) 제어 */
    openAlert: () => set({ alertOpen: true }),
    closeAlert: () => set({ alertOpen: false }),

    /** 현재 basket 반환 (필요 시 외부 사용) */
    getBasket: () => get().basket,
  }))
);
