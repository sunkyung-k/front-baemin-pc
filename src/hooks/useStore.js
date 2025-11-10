import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/**
 * useStore 훅 (React Query 기반 단일 스토어 관리)
 *
 * 이 훅은 React Query를 사용하여 특정 도메인(여기서는 '가게')의
 * 상세 데이터 조회 및 CRUD 뮤테이션 로직을 캡슐화합니다.
 *
 * 공통 패턴 (다른 도메인 훅 재사용 시 참고):
 * 1. **쿼리 키 정의**: `QUERY_KEYS`와 사용자 ID 등 식별자를 포함하여 고유 키 생성.
 * 2. **상세 조회 (`useQuery`)**: 해당 도메인 데이터를 조회하며, `enabled`로 조건부 활성화.
 * 3. **CRUD 뮤테이션 (`useMutation`)**: 등록/수정/삭제 기능을 정의.
 * - `onSettled`에서 **`useAfterMutation` 훅**을 호출하여 중앙 집중식 캐시 관리를 수행.
 * 4. **반환**: 데이터, 로딩 상태, CRUD 함수를 일관된 형태로 반환.
 */
export function useStore() {
  // 식별자 및 쿼리 키 정의
  const queryClient = useQueryClient();
  const userId = authStore((s) => s.userId);
  const queryKey = [QUERY_KEYS.MY_STORE, userId];

  /** 공통 후처리 훅: 상세 데이터 갱신 (등록·수정 후 캐시 refetch 또는 업데이트) */
  const afterMutationDetail = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: true, // 스크롤top 있을 시에만 null과 함께 추가
  });

  /** 삭제 후처리 훅: 상세 캐시 제거 및 목록/Zustand 동기화 */
  const afterMutationDelete = useAfterMutation(
    AFTER_TYPES.DELETE,
    () => authStore.getState().clearStoreId(),
    { scrollTop: true }
  );

  // 상세 조회 (Read)
  /** 내 가게 조회 (myStore 상세 데이터) */
  const { data: myStore, refetch } = useQuery({
    queryKey,
    queryFn: storeAPI.getMyStore,
    enabled: !!userId,
    onError: (err) => handleApiError(err, "useStore.getMyStore"),
  });

  // CRUD 뮤테이션 (Create, Update, Delete)

  /** 가게 등록 (Create) */
  const create = useMutation({
    mutationFn: storeAPI.create,
    onSettled: () => afterMutationDetail(queryKey),
    onError: (err) => handleApiError(err, "useStore.create"),
  });

  /** 가게 수정 (Update) */
  const update = useMutation({
    mutationFn: storeAPI.update,
    onSettled: (data, error, variables) => {
      afterMutationDetail(queryKey);
      const storeId = variables?.get?.("storeId");
      if (storeId) {
        queryClient.invalidateQueries([QUERY_KEYS.STORE_DETAIL, storeId]);
      }
    },
    onError: (err) => handleApiError(err, "useStore.update"),
  });

  /** 가게 삭제 (Delete) */
  const remove = useMutation({
    mutationFn: storeAPI.remove,
    onSettled: async () => {
      await afterMutationDelete(queryKey);
      console.log("[useStore] 가게 삭제 후처리 완료 → 캐시 및 상태 초기화");
    },
    onError: (err) => handleApiError(err, "useStore.remove"),
  });

  return {
    myStore,
    refetch,
    create,
    update,
    remove,
  };
}

export default useStore;
