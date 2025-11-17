import { useQuery } from "@tanstack/react-query";
import adminStoreAPI from "@/service/admin/adminStoreAPI";

/**
 * useAdminStoreList (관리자 전용)
 * - 사용자 모드와 완전히 분리된 필터 규칙 적용
 * - addr 제거 / caId 변환 / searchText trim 등 모든 정제는 여기서 처리
 */
export function useAdminStoreList(filters = {}) {
  const params = {
    ...filters,
    addr: undefined, // 관리자에서는 주소 필터 제거
    searchText: filters.searchText?.trim() || null,
    caId: filters.caId === 0 ? null : filters.caId,
    sort: filters.sort || "ratingAvg,desc",
  };

  const { data } = useQuery({
    queryKey: ["adminStoreList", params],
    queryFn: () => adminStoreAPI.getList(params),
    staleTime: 60 * 1000,
  });

  return {
    stores: data?.content ?? [],
    pageInfo: data?.pageInfo ?? null,
  };
}
