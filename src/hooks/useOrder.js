// src/hooks/order/useOrder.js
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import basketAPI from "@/service/basketAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";

/**
 * useOrder 훅 (React Query 기반 결제/장바구니 관리)
 * ------------------------------------------------------
 * - 결제 페이지 전용 (주문 생성 및 장바구니 조작 포함)
 * - React Query의 useMutation을 활용해 CRUD 로직 캡슐화
 * - 공통 후처리(useAfterMutation)로 캐시 관리 일원화
 */
export function useOrder() {
  // 공통 인스턴스
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  /** 공통 후처리 훅: 장바구니 캐시 갱신 */
  const afterMutationBasket = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: false,
  });

  /** 주문(결제) 생성 */
  const orderAll = useMutation({
    mutationFn: basketAPI.orderAll,
    onSettled: () => {
      afterMutationBasket([QUERY_KEYS.BASKET]);
    },
    onError: (err) => handleError(err, "useOrder.orderAll"),
  });

  /** 단일 항목 삭제 */
  const removeItem = useMutation({
    mutationFn: basketAPI.removeItem,
    onSettled: () => {
      afterMutationBasket([QUERY_KEYS.BASKET]);
    },
    onError: (err) => handleError(err, "useOrder.removeItem"),
  });

  /** 장바구니 전체 삭제 */
  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onSettled: () => {
      afterMutationBasket([QUERY_KEYS.BASKET]);
    },
    onError: (err) => handleError(err, "useOrder.clearAll"),
  });

  return {
    orderAll,
    removeItem,
    clearAll,
  };
}

export default useOrder;
