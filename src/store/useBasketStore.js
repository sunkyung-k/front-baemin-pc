import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useBasketStore (Zustand)
 * ------------------------------------------------------
 * - 장바구니 전역 상태 (React Query + Zustand 병행 관리)
 * - React Query: 서버 데이터(fetch)
 * - Zustand: 로컬 UI/렌더링용 상태 보관
 */
export const useBasketStore = create(
  devtools(
    (set, get) => ({
      /** 장바구니 데이터 (서버 응답 vo) */
      basket: null,

      /** 현재 장바구니의 가게 ID */
      currentStoreId: null,

      /**
       * 장바구니 데이터 세팅
       * - React Query(useBasket)에서 getMyBasket 성공 시 호출
       * - storeId가 없으면 itemList의 첫 메뉴에서 추출
       */
      setBasket: (data) => {
        if (!data) {
          set({ basket: null, currentStoreId: null });
          return;
        }

        let storeId = data?.storeId ?? null;
        if (
          !storeId &&
          Array.isArray(data.itemList) &&
          data.itemList.length > 0
        ) {
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

      /** 현재 장바구니 데이터 반환 */
      getBasket: () => get().basket,
    }),
    { name: "BasketStore" }
  )
);
