// src/hooks/useStoreList.js
import { useQuery } from "@tanstack/react-query";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeListAPI from "@/service/storeListAPI";
import { handleApiError } from "@/utills/handleApiError";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * 🏪 useStoreList 훅 (React Query 기반 가게 목록 조회)
 * ---------------------------------------------------------
 * ✔ 변경 사항:
 * - addr(주소) 반드시 필요
 * - 주소 없으면 호출 안 함
 */
export function useStoreList(filters = {}) {
  const { address } = useAddressStore();

  // 캐시 키 (주소 포함해서 고유화)
  const queryKey = QUERY_KEYS.STORE_LIST({ ...filters, addr: address });

  // 공통 후처리 훅
  const afterMutationList = useAfterMutation(AFTER_TYPES.LIST, null, {
    scrollTop: false,
  });

  // API 요청 함수
  const fetchStoreList = async () => {
    if (!address) {
      console.warn("⚠️ 주소가 없어 가게 목록 요청이 취소됨");
      alert("현재 위치를 먼저 설정해주세요!");
      return [];
    }
    return await storeListAPI.getStores(filters);
  };

  // React Query
  const {
    data: stores = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchStoreList,
    enabled: !!address, // 주소가 있을 때만 실행
    staleTime: 1000 * 60,
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
    afterMutationList,
  };
}

export default useStoreList;
