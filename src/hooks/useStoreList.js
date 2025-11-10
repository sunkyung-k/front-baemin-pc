import { useQuery } from "@tanstack/react-query";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useStoreList 훅
 * ------------------------------------------------------
 * - 가게 목록 조회 전용
 * - 주소 기반 필터링 + 카테고리, 검색어 옵션 지원
 * - useAfterMutation으로 목록 캐시 자동 갱신
 * - 로딩/에러는 전역(GlobalLoading + handleApiError) 처리
 */
export function useStoreList(filters = {}) {
  const { address } = useAddressStore();

  /** 필터 정규화 */
  const normalizedCaId =
    !filters.caId || filters.caId === "all" ? null : filters.caId;

  /** 서버 요청 파라미터 */
  const params = {
    ...filters,
    addr: address,
    caId: normalizedCaId,
    searchText: filters.searchText?.trim() || null,
  };

  /** 쿼리 키 정의 */
  const queryKey = QUERY_KEYS.STORE_LIST(params);

  /** 목록 갱신 후처리 훅 */
  const afterMutationList = useAfterMutation(AFTER_TYPES.LIST, null, {
    scrollTop: false,
  });

  /** API 호출 */
  const fetchStoreList = async () => {
    if (!address) return []; // 주소 없으면 스킵
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
