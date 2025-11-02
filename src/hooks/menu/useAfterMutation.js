import { useQueryClient } from "@tanstack/react-query";

/**
 * CRUD 후처리 통합 훅
 * - type: "list" | "detail"
 * - onSync: Zustand 등 로컬 상태 동기화 함수 (선택)
 *
 * 예시:
 * const afterMutation = useAfterMutation("detail", refreshMenu);
 * onSettled: () => afterMutation(QUERY_KEYS.MENU_DETAIL(menuId));
 */
export const useAfterMutation = (type = "list", onSync = null) => {
  const queryClient = useQueryClient();

  const handleAfterMutation = async (queryKey) => {
    if (!queryKey) return;

    try {
      switch (type) {
        /** 목록 데이터 (카테고리, 메뉴 등) */
        case "list": {
          // invalidateQueries만으로 충분
          // → 자동으로 stale 상태가 되어 다음 렌더에서 refetch 발생
          await queryClient.invalidateQueries({ queryKey });

          // 로컬 상태 동기화 (선택)
          if (typeof onSync === "function") await onSync();
          break;
        }

        /** 상세 데이터 (옵션 그룹, 옵션 등) */
        case "detail": {
          // 상세 데이터는 즉시 refetch (사용자가 바로 확인하므로)
          await queryClient.refetchQueries({ queryKey });

          // 로컬 상태 동기화
          if (typeof onSync === "function") await onSync();
          break;
        }

        default:
          console.warn(`[useAfterMutation] Unknown type: ${type}`);
          break;
      }
    } catch (err) {
      console.error("[useAfterMutation] error:", err);
    }
  };

  return handleAfterMutation;
};

export default useAfterMutation;
