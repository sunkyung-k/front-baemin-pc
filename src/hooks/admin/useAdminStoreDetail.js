import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminStoreAPI from "@/service/admin/adminStoreAPI";
import { handleApiError } from "@/utills/handleApiError";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * useAdminStoreDetail (어드민 가게 상세 페이지 전용 훅)
 * ---------------------------------------------------------
 * 어드민 가게 상세 훅 — 휴무/영업 변경 & 삭제 담당
 * 상태 변경 시 상세([STORE_DETAIL, storeId]) + 리스트(adminStoreList) 캐시 무효화
 * 삭제 시 리스트 전체 무효화
 */
export default function useAdminStoreDetail() {
  const queryClient = useQueryClient();

  /** PUT - 가게 휴무/영업 상태 변경 */
  const updateStatus = useMutation({
    mutationFn: ({ storeId, closeYn }) =>
      adminStoreAPI.updateStatus({ storeId, closeYn }),

    onSuccess: (_, { storeId }) => {
      alert("영업 상태가 변경되었습니다.");

      // 상세 페이지 캐시 무효화 (storeId 포함한 정확한 key
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STORE_DETAIL, storeId],
        exact: true,
      });

      // 관리자 가게 리스트 무효화 (prefix match)
      queryClient.invalidateQueries({
        queryKey: ["adminStoreList"],
        exact: false,
      });
    },

    onError: (err) => handleApiError(err, "adminStoreDetail.updateStatus"),
  });

  /** DELETE - 가게 삭제 */
  const remove = useMutation({
    mutationFn: (storeId) => adminStoreAPI.delete(storeId),

    onSuccess: () => {
      alert("가게가 삭제되었습니다.");

      queryClient.invalidateQueries({
        queryKey: ["adminStoreList"],
        exact: false,
      });
    },

    onError: (err) => handleApiError(err, "adminStoreDetail.delete"),
  });

  return {
    updateStatus,
    remove,
  };
}
