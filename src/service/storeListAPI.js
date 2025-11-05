import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";

/**
 * useStoreList 훅 (React Query 기반 공용 가게 리스트/상세 관리)
 *
 * ✔ 공통 패턴
 * 1. `storeListAPI`로 API 요청 (axios 계층)
 * 2. React Query로 캐싱 + 자동 refetch
 * 3. 에러는 `handleApiError`로 중앙처리
 *
 * ✅ 용도
 * - 일반 유저가 보는 가게 목록 페이지 (/store)
 * - 가게 상세 페이지 (/store/:id)
 */
export function useStoreList(params = {}) {
  const queryKey = [
    QUERY_KEYS.STORE_LIST,
    params.caId ?? "",
    params.searchText ?? "",
  ];

  /** 🏪 가게 목록 조회 */
  const {
    data: stores = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStores(params),
    onError: (err) => handleApiError(err, "useStoreList.getStores"),
    staleTime: 60 * 1000, // 1분 캐싱
  });

  return {
    stores,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useStoreDetail 훅 (React Query 기반 단일 가게 상세 관리)
 *
 * - 특정 가게 ID(storeId)에 대한 상세 정보 조회
 */
export function useStoreDetail(storeId) {
  const queryKey = [QUERY_KEYS.STORE_DETAIL, storeId];

  /** 🏪 가게 상세 조회 */
  const {
    data: storeDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => storeListAPI.getStoreDetail(storeId),
    enabled: !!storeId, // storeId가 있을 때만 실행
    onError: (err) => handleApiError(err, "useStoreDetail.getStoreDetail"),
    staleTime: 60 * 1000, // 1분 캐싱
  });

  return {
    storeDetail,
    isLoading,
    isError,
    refetch,
  };
}

export default {
  useStoreList,
  useStoreDetail,
};
