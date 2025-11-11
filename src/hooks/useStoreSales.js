import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import orderAPI from "@/service/orderAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * 점주용 매출 요약 조회 훅
 * ------------------------------------
 * - 오늘 수입 / 이번달 수입 데이터 반환
 * - React Query 캐시 자동 관리 + invalidate 지원
 */
export const useStoreSales = (storeId) => {
  const handleError = useHandleError();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.STORE_SALES, storeId],
    queryFn: () => orderAPI.getStoreSales(storeId),
    enabled: !!storeId,
    onError: handleError,
  });

  /** 외부에서 매출 요약 즉시 갱신하고 싶을 때 호출 */
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STORE_SALES, storeId],
      exact: false,
    });

  return { ...query, invalidate };
};
