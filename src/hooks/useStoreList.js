import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useStoreList 훅
 * ------------------------------------------------------
 * - 주소 기반 가게 목록 조회 (필터는 상위 훅에서 세팅)
 * - 전역 에러 및 로딩은 공용으로 처리
 */
export function useStoreList(filters = {}) {
  const { address } = useAddressStore();

  /** 서버 요청 파라미터 */
  const params = {
    ...filters,
    addr: address,
    searchText: filters.searchText?.trim() || null,
    caId: filters.caId === 0 ? null : filters.caId,
    sort: filters.sort || "ratingAvg,desc",
  };

  /** 쿼리 키 정의 */
  const queryKey = QUERY_KEYS.STORE_LIST(params);

  /** API 호출 */
  const fetchStoreList = async () => {
    if (!address) return [];
    try {
      const data = await storeListAPI.getStores(params);
      if (import.meta.env.DEV)
        console.log("[useStoreList] fetched stores:", data);
      return data;
    } catch (err) {
      handleApiError(err, "useStoreList.getStores");
      return [];
    }
  };

  /** React Query 설정 */
  const { data, refetch } = useQuery({
    queryKey,
    queryFn: fetchStoreList,
    enabled: !!address,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const stores = data?.content ?? [];
  const pageInfo = data?.pageInfo ?? null;

  return { stores, pageInfo, refetch };
}

export default useStoreList;
