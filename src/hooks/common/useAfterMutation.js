import { useQueryClient } from "@tanstack/react-query";

/** AfterMutation 타입 상수 */
export const AFTER_TYPES = {
  LIST: "list", // 목록 invalidate
  DETAIL: "detail", // 상세 refetch or setQueryData (수정/등록 후 상세 반영)
  DELETE: "delete", // 삭제용 (캐시 제거 + null 세팅 + 목록 갱신)
  CUSTOM: "custom", // 사용자 정의
};

/**
 * 범용 CRUD 후처리 훅 (최종 안정화 및 DELETE 통합 버전)
 * ------------------------------------------------------
 * - 등록·수정·삭제 모두 대응하는 공용 훅
 * - React Query + Zustand 하이브리드 구조에 최적화
 * - DELETE 시 상세 캐시 즉시 제거 및 선택적 목록 갱신
 *
 * @param {string} type - 후처리 타입 (LIST, DETAIL, DELETE, CUSTOM)
 * @param {function | null} onSync - Zustand 또는 로컬 상태 동기화 함수
 */
export const useAfterMutation = (
  type = AFTER_TYPES.LIST,
  onSync = null,
  options = { scrollTop: false }
) => {
  const queryClient = useQueryClient();

  /**
   * 뮤테이션 후처리 함수
   * @param {import("@tanstack/react-query").QueryKey} queryKey - 처리할 쿼리 키 (LIST: 목록 키, DETAIL/DELETE: 상세 키)
   * @param {import("@tanstack/react-query").QueryKey | null} [listQueryKey] - DELETE 타입 시 **필수**로 갱신할 목록 쿼리 키
   */
  const handleAfterMutation = async (queryKey, listQueryKey = null) => {
    if (!queryKey) {
      console.warn("[useAfterMutation] queryKey가 없습니다.");
      return;
    }

    try {
      // 공통: onSync 먼저 실행 (Zustand나 로컬 스토어 동기화)
      let newData = null;
      if (typeof onSync === "function") {
        // onSync의 반환값(newData)은 React Query 캐시 업데이트에 활용됩니다.
        newData = await onSync(queryClient);
      }

      // 타입별 후처리
      switch (type) {
        /** 목록 invalidate */
        case AFTER_TYPES.LIST:
          await queryClient.invalidateQueries({
            queryKey,
            // active 상태인 쿼리만 재요청하여 불필요한 네트워크 요청 최소화
            refetchType: "active",
          });
          break;

        /** 상세 refetch or 즉시 반영 (수정 후 상세 화면 갱신에 특히 유용) */
        case AFTER_TYPES.DETAIL:
          if (newData) {
            // 서버 요청 없이 캐시 즉시 업데이트 (기존 데이터 유지하며 newData 병합)
            queryClient.setQueryData(queryKey, (old) => ({
              ...old,
              // old가 undefined/null인 경우를 대비해 기본값 병합 처리
              ...(newData || {}),
            }));
          } else {
            // fallback: 서버 Refetch
            await queryClient.invalidateQueries({
              queryKey,
              refetchType: "active",
            });
          }
          break;

        /** 삭제 (즉시 캐시 제거 + null 세팅 + 목록 갱신) */
        case AFTER_TYPES.DELETE:
          // 상세 캐시 즉시 제거 (상세 페이지의 UI 리셋 및 메모리 확보)
          await queryClient.cancelQueries({ queryKey }); // 진행 중인 요청 취소
          queryClient.setQueryData(queryKey, null); // 상세 페이지 UI 즉시 리셋 (데이터 없음)
          queryClient.removeQueries({ queryKey }); // 캐시 자체 제거

          // 목록 갱신
          if (listQueryKey) {
            await queryClient.invalidateQueries({
              queryKey: listQueryKey, // 인자로 받은 목록 쿼리 키를 갱신
              refetchType: "active",
            });
          }
          break;

        /** 사용자 정의 */
        case AFTER_TYPES.CUSTOM:
          // onSync만 실행하는 것이 기본이지만, newData가 있다면 캐시에도 병합 반영
          if (newData) {
            queryClient.setQueryData(queryKey, (old) => ({
              ...old,
              ...(newData || {}),
            }));
          }
          break;

        default:
          console.warn(`[useAfterMutation] Unknown type: ${type}`);
      }

      // 모든 후처리 후 scrollTop 실행 (선택 옵션)
      if (options.scrollTop) {
        document.querySelector("body").scrollTo({ top: 0 });
      }
    } catch (err) {
      console.error("[useAfterMutation] Error:", err);
    }
  };

  return handleAfterMutation;
};

export default useAfterMutation;
