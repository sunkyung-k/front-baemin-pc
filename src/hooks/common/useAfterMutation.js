import { useQueryClient } from "@tanstack/react-query";

/** AfterMutation 타입 상수 */
export const AFTER_TYPES = {
  LIST: "list",
  DETAIL: "detail",
  CUSTOM: "custom",
};

/**
 * 범용 CRUD 후처리 훅 (최신 리팩토링 버전)
 * ------------------------------------------------------
 * - React Query + Zustand 완전 병행 구조
 * - 서버 재요청 최소화, 캐시 즉시 반영 중심
 * - 모든 도메인(가게, 메뉴, 장바구니 등)에 공용 사용 가능
 */
export const useAfterMutation = (type = AFTER_TYPES.LIST, onSync = null) => {
  const queryClient = useQueryClient();

  const handleAfterMutation = async (queryKey) => {
    if (!queryKey) {
      console.warn("[useAfterMutation] queryKey가 없습니다.");
      return;
    }

    try {
      // 공통: onSync 먼저 실행 (Zustand나 로컬 스토어 동기화)
      let newData = null;
      if (typeof onSync === "function") {
        newData = await onSync(queryClient); // 반환값 있으면 React Query 캐시에 반영됨
      }

      // 타입별 후처리
      switch (type) {
        case AFTER_TYPES.LIST:
          await queryClient.invalidateQueries({ queryKey });
          break;

        case AFTER_TYPES.DETAIL:
          if (newData) {
            // 서버 요청 없이 캐시 즉시 업데이트 (성능 향상)
            queryClient.setQueryData(queryKey, newData);
          } else {
            // fallback: 서버 refetch (기존 로직 유지)
            await queryClient.refetchQueries({ queryKey });
          }
          break;

        case AFTER_TYPES.CUSTOM:
          // onSync만 실행됨
          break;

        default:
          console.warn(`[useAfterMutation] Unknown type: ${type}`);
      }
    } catch (err) {
      console.error("[useAfterMutation] Error:", err);
    }
  };

  return handleAfterMutation;
};

export default useAfterMutation;
