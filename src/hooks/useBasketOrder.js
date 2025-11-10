import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import basketAPI from "@/service/basketAPI";

export const useBasketOrder = () => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();
  const { clearBasket, setBasket } = useBasketStore();

  const afterMutationBasket = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: false,
  });

  /** 단일 항목 삭제 */
  const removeItem = async (basketItemId) => {
    try {
      await basketAPI.removeItem(basketItemId);

      // React Query 캐시 새로고침
      await queryClient.invalidateQueries([QUERY_KEYS.BASKET]);

      // Zustand 전역상태도 새로 불러오기
      const updated = await basketAPI.getMyBasket();
      setBasket(updated);

      afterMutationBasket([QUERY_KEYS.BASKET]);
    } catch (err) {
      handleError(err, "useBasketOrder.removeItem");
    }
  };

  /** 전체 삭제 */
  const clearAll = async () => {
    try {
      await basketAPI.clearAll();

      // 전역 스토어 비우기
      clearBasket();

      // 캐시 갱신
      await queryClient.invalidateQueries([QUERY_KEYS.BASKET]);

      // 후처리
      afterMutationBasket([QUERY_KEYS.BASKET]);
    } catch (err) {
      handleError(err, "useBasketOrder.clearAll");
    }
  };

  /** 전체 주문 */
  const orderAll = async () => {
    try {
      await basketAPI.orderAll();
      afterMutationBasket([QUERY_KEYS.BASKET]);
    } catch (err) {
      handleError(err, "useBasketOrder.orderAll");
    }
  };

  return { orderAll, removeItem, clearAll };
};
