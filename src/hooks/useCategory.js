import { useQuery } from "@tanstack/react-query";
import { categoryAPI } from "@/service/categoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * 가게 카테고리 목록 캐시 조회
 * React Query 기반 (자동 캐싱 + 에러 관리)
 * QUERY_KEYS.STORE_CATEGORY_LIST 사용
 */
export function useCategory() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.STORE_CATEGORY_LIST,
    queryFn: async () => {
      const data = await categoryAPI.getCategories();
      return (data || []).map((item) => ({
        id: item.caId,
        name: item.caName,
      }));
    },
    staleTime: 1000 * 60 * 10, // 10분 동안 캐시 유지
    retry: 1, // 실패 시 1회 재시도
  });

  return { categories, isLoading, isError, error };
}
