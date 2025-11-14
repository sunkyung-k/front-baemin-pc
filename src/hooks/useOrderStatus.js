import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { authStore } from "@/store/authStore";
import orderAPI from "@/service/orderAPI";
import accountAPI from "@/service/accountAPI";

/**
 * useOrderStatus
 * -----------------------------------------------------
 * - 배달완료 / 주문취소 후 React Query 캐시 자동 무효화
 * - invalidate 기반 자동 리렌더 (refetchQueries 미사용)
 * - STORE_SALES, USER_INFO 모두 실시간 반영
 */
export const useOrderStatus = (page = 0) => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();
  const { userId } = authStore.getState();

  const updateStatus = async (orderId, newStatus) => {
    try {
      // 1. 서버에 주문 상태 변경 요청
      await orderAPI.updateStatus(orderId, newStatus);

      // 2. 관련 쿼리 무효화 (자동 리렌더 유도)
      const invalidateTargets = [
        [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
        [QUERY_KEYS.MY_ORDER_LIST],
        [QUERY_KEYS.MY_ORDER_RECENT_LIST],
        [QUERY_KEYS.STORE_SALES],
      ];

      for (const key of invalidateTargets) {
        queryClient.invalidateQueries({ queryKey: key, exact: false });
      }

      // 3. 내 정보(balance/deposit)도 즉시 반영
      if (userId) {
        const key = QUERY_KEYS.USER_INFO(userId);

        // (1) invalidate로 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: key, exact: true });

        // (2) 서버에서 최신 데이터 직접 받아와 캐시에 즉시 주입
        const latestUserInfo = await accountAPI.getUserInfo();
        queryClient.setQueryData(key, latestUserInfo);
      }
    } catch (err) {
      handleError(err, "useOrderStatus.updateStatus");
    }
  };

  return { updateStatus };
};
