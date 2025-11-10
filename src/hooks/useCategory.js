import { useQuery } from "@tanstack/react-query";
import { categoryAPI } from "@/service/categoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * useCategory 훅
 * ------------------------------------------------------
 * - 가게 카테고리 목록 캐시 조회
 * - React Query 기반 자동 캐싱
 * - 에러 및 로딩은 전역(GlobalLoading + handleApiError) 처리
 */
export function useCategory() {
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.STORE_CATEGORY_LIST,
    queryFn: async () => {
      const data = await categoryAPI.getCategories();
      return (data || []).map((item) => ({
        id: item.caId,
        name: item.caName,
      }));
    },
    staleTime: 1000 * 60 * 10, // 10분 캐시 유지
    retry: 1, // 실패 시 1회 재시도
  });

  return { categories };
}

export default useCategory;
