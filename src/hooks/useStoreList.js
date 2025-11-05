import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";

/**
 * useStoreList 훅
 * --------------------------------------------
 * - 공용 가게 목록 조회 (React Query 기반)
 * - 캐시 키: QUERY_KEYS.STORE_LIST(filters)
 * - 필터(카테고리, 검색어 등)가 바뀌면 자동 refetch
 */
export function useStoreList(filters = {}) {
  const queryKey = QUERY_KEYS.STORE_LIST(filters);

  const {
    data: stores = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStores(filters),
    staleTime: 60 * 1000, // 1분 캐싱
    onError: (err) => handleApiError(err, "useStoreList.getStores"),
  });

  return { stores, isLoading, isError, refetch };
}

/**
 * useStoreDetail 훅
 * --------------------------------------------
 * - 단일 가게 상세 조회 (React Query 기반)
 * - 캐시 키: QUERY_KEYS.STORE_DETAIL(storeId)
 * - storeId가 존재할 때만 동작 (enabled 조건)
 */
export function useStoreDetail(storeId) {
  const queryKey = QUERY_KEYS.STORE_DETAIL(storeId);

  const {
    data: storeDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStoreDetail(storeId),
    enabled: !!storeId,
    staleTime: 60 * 1000,
    onError: (err) => handleApiError(err, "useStoreDetail.getStoreDetail"),
  });

  return { storeDetail, isLoading, isError, refetch };
}

export default {
  useStoreList,
  useStoreDetail,
};
