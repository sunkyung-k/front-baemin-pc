import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import orderAPI from "@/service/orderAPI";

/**
 * 주문 상태 변경 훅 (v4 완전형)
 * -----------------------------------------------------
 * - 배달완료 / 주문취소 등 상태 업데이트
 * - React Query 캐시 무효화 + 강제 refetch
 * - 매출요약(STORE_SALES) 즉시 반영
 * - 새로고침 없이 실시간 반영 보장
 */
export const useOrderStatus = (page = 0) => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  const updateStatus = async (orderId, newStatus) => {
    try {
      // 서버에 주문 상태 변경 요청
      await orderAPI.updateStatus(orderId, newStatus);

      // 현재 페이지의 점주 주문 목록 캐시 취소 및 즉시 refetch
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
      });

      // invalidate + refetch 보장 (즉시 새 데이터 요청)
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
        exact: true,
      });

      // 유저 주문 내역도 함께 갱신
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_ORDER_LIST],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MY_ORDER_LIST],
        exact: false,
      });

      /* 최근 24시간 주문 내역도 함께 갱신 [주문 현황] */
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MY_ORDER_RECENT_LIST],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MY_ORDER_RECENT_LIST],
        exact: false,
      });

      // 매출 요약 캐시도 즉시 무효화 + 재조회
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STORE_SALES],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.STORE_SALES],
        exact: false,
      });

      console.info("주문 상태 갱신 및 캐시 동기화 완료");
    } catch (err) {
      handleError(err, "useOrderStatus.updateStatus");
    }
  };

  return { updateStatus };
};
