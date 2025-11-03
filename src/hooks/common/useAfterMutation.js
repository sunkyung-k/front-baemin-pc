import { useQueryClient } from "@tanstack/react-query";

/**
 *  범용 CRUD 후처리 훅 (전역 공용)
 *
 * - 모든 도메인(가게, 메뉴, 장바구니, 회원 등)에 사용 가능
 * - type:
 *   - "list"   → 목록형 데이터 (invalidate)
 *   - "detail" → 상세형 데이터 (refetch)
 *   - "custom" → 직접 지정한 후처리 함수 실행
 * - onSync: Zustand 등 로컬 상태 갱신 함수 (선택)
 *
 * 사용 예시:
 * ------------------------------------------------------
 * const afterMutation = useAfterMutation("detail", refreshStore);
 * onSettled: () => afterMutation(QUERY_KEYS.STORE_DETAIL(storeId));
 *
 * const afterMutation = useAfterMutation("list");
 * onSettled: () => afterMutation(["storeList"]);
 * ------------------------------------------------------
 */
export const useAfterMutation = (type = "list", onSync = null) => {
  const queryClient = useQueryClient();

  const handleAfterMutation = async (queryKey) => {
    if (!queryKey) {
      console.warn("[useAfterMutation] queryKey가 없습니다.");
      return;
    }

    try {
      switch (type) {
        /** 목록 데이터 (invalidate only) */
        case "list": {
          await queryClient.invalidateQueries({ queryKey });
          if (typeof onSync === "function") await onSync();
          break;
        }

        /** 상세 데이터 (즉시 refetch) */
        case "detail": {
          await queryClient.refetchQueries({ queryKey });
          if (typeof onSync === "function") await onSync();
          break;
        }

        /** 커스텀 타입: onSync만 실행 */
        case "custom": {
          if (typeof onSync === "function") await onSync(queryClient);
          break;
        }

        default: {
          console.warn(`[useAfterMutation] Unknown type: ${type}`);
        }
      }
    } catch (err) {
      console.error("[useAfterMutation] Error:", err);
    }
  };

  return handleAfterMutation;
};

export default useAfterMutation;
