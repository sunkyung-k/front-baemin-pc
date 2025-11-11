import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useBasketStore (정식 구조)
 * ------------------------------------------------------
 * - React Query와 병행되는 로컬 장바구니 상태 관리
 * - clearBasket()은 명시적 Lock + unlock 구조로 전환
 */
export const useBasketStore = create(
  devtools(
    (set, get) => ({
      basket: null,
      currentStoreId: null,
      isLocked: false, // refetch 중 동기화 방지용 Lock 플래그

      /** 장바구니 데이터 세팅 */
      setBasket: (data) => {
        const { isLocked } = get();

        // refetch 중에는 서버 데이터 무시
        if (isLocked) return;

        // 빈 데이터 처리
        if (
          !data ||
          (!data.storeId && (!data.itemList || data.itemList.length === 0))
        ) {
          set({ basket: null, currentStoreId: null });
          return;
        }

        // storeId 추출
        let storeId = data.storeId ?? null;
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

      /** 장바구니 전체 비우기 (Lock 활성화) */
      clearBasket: () => {
        set({
          basket: null,
          currentStoreId: null,
          isLocked: true, // refetch 동안 상태 변경 방지
        });
      },

      /** Lock 해제 (React Query refetch 완료 후 호출) */
      releaseLock: () => {
        const { isLocked } = get();
        if (isLocked) set({ isLocked: false });
      },

      /** 현재 장바구니 데이터 반환 */
      getBasket: () => get().basket,
    }),
    { name: "BasketStore" }
  )
);
