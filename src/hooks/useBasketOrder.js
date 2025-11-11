import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import basketAPI from "@/service/basketAPI";

export const useBasketOrder = () => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();
  const { clearBasket, releaseLock } = useBasketStore();

  const afterMutationBasket = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: false,
  });

  /** 단일 항목 삭제 */
  const removeItem = async (basketItemId) => {
    try {
      await basketAPI.removeItem(basketItemId);

      // 캐시 무효화 + 서버 동기화
      await queryClient.invalidateQueries([QUERY_KEYS.BASKET]);

      // refetch 완료 후 Lock 해제
      releaseLock();

      // React Query 후처리
      afterMutationBasket([QUERY_KEYS.BASKET]);
    } catch (err) {
      releaseLock(); // 에러 시에도 Lock 해제
      handleError(err, "useBasketOrder.removeItem");
    }
  };

  /** 전체 삭제 */
  const clearAll = async () => {
    try {
      // 서버 요청
      await basketAPI.clearAll();

      // Zustand 비움 + Lock 설정
      clearBasket();

      // 캐시 무효화 → 서버 동기화
      await queryClient.invalidateQueries([QUERY_KEYS.BASKET]);

      // 후처리 및 Lock 해제
      afterMutationBasket([QUERY_KEYS.BASKET]);
      releaseLock();
    } catch (err) {
      releaseLock();
      handleError(err, "useBasketOrder.clearAll");
    }
  };

  /** 전체 주문 */
  const orderAll = async (payload) => {
    try {
      // 장바구니 즉시 비움 + Lock 설정
      clearBasket();

      // 주문 요청
      await basketAPI.orderAll(payload);

      // 서버 재조회
      await queryClient.invalidateQueries([QUERY_KEYS.BASKET]);

      // 후처리 + Lock 해제
      afterMutationBasket([QUERY_KEYS.BASKET]);
      releaseLock();
    } catch (err) {
      releaseLock();
      handleError(err, "useBasketOrder.orderAll");
    }
  };

  return { orderAll, removeItem, clearAll };
};
