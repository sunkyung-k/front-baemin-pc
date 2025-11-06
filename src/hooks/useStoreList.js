import { useQuery } from "@tanstack/react-query";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";

/**
 * useStoreList 훅 (React Query 기반 가게 목록 조회)
 * ---------------------------------------------------------
 * ✔ 패턴 통일:
 * - useStore 훅과 동일한 구조로 유지
 * - 조회 전용 (Read-only)
 * - 필요 시 afterMutation으로 invalidate 트리거 가능
 */
export function useStoreList(filters = {}) {
  // 캐시 키 (필터별로 고유 캐시 생성)
  const queryKey = QUERY_KEYS.STORE_LIST(filters);

  // 공통 후처리 훅: 목록 invalidate (필요 시 외부에서 사용)
  const afterMutationList = useAfterMutation(AFTER_TYPES.LIST, null, {
    scrollTop: false,
  });

  // 목록 조회
  const {
    data: stores = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStores(filters),
    staleTime: 1000 * 60, // 1분 캐싱
    retry: 1,
    onError: (err) => handleApiError(err, "useStoreList.getStores"),
  });

  // 개발 환경 로그
  if (import.meta.env.MODE === "development" && stores?.length) {
    console.log("[useStoreList] fetched stores:", stores);
  }

  return {
    stores,
    isLoading,
    isError,
    refetch,
    afterMutationList, // 필요 시 invalidate용 후처리 제공
  };
}

/**
 * useStoreDetail 훅 (단일 가게 상세)
 * ---------------------------------------------------------
 * ✔ 패턴 통일:
 * - useStore 훅과 동일한 구조
 * - enabled 조건으로 안전하게 쿼리 제어
 */
export function useStoreDetail(storeId) {
  const queryKey = QUERY_KEYS.STORE_DETAIL(storeId);

  // 후처리 훅: 상세 invalidate (등록/수정 후 반영용)
  const afterMutationDetail = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: true,
  });

  const {
    data: storeDetail = null,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStoreDetail(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60,
    retry: 1,
    onError: (err) => handleApiError(err, "useStoreDetail.getStoreDetail"),
  });

  if (import.meta.env.MODE === "development" && storeDetail) {
    console.log("[useStoreDetail] storeDetail:", storeDetail);
  }

  return {
    storeDetail,
    isLoading,
    isError,
    refetch,
    afterMutationDetail,
  };
}

export default {
  useStoreList,
  useStoreDetail,
};
