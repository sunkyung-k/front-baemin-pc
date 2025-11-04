import { useQuery, useMutation } from "@tanstack/react-query";
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
  const userId = authStore((s) => s.userId); // 다른 훅에서는 product/order ID 등을 사용할 수 있습니다.
  const queryKey = [QUERY_KEYS.MY_STORE, userId]; // 상세 데이터 쿼리 키

  /** 공통 후처리 훅: 상세 데이터 갱신 (등록·수정 후 캐시 refetch 또는 업데이트) */
  const afterMutationDetail = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: true, // 스크롤top 있을 시에만 null과 함께 추가
  });

  /** 삭제 후처리 훅: 상세 캐시 제거 및 목록/Zustand 동기화 */
  const afterMutationDelete = useAfterMutation(
    AFTER_TYPES.DELETE,
    () => {
      // Zustand 상태도 같이 정리 (선택 사항: 필요한 경우에만 추가)
      authStore.getState().clearStoreId();
    },
    { scrollTop: true } // 스크롤top 있을 시에만 추가
  );

  // 상세 조회 (Read)
  /** 내 가게 조회 (myStore 상세 데이터) */
  const {
    data: myStore,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: storeAPI.getMyStore,
    enabled: !!userId,
    onError: (err) => handleApiError(err, "useStore.getMyStore"),
  });

  // CRUD 뮤테이션 (Create, Update, Delete)

  /** 가게 등록 (Create) */
  const create = useMutation({
    mutationFn: storeAPI.create,
    // 등록 후 상세 쿼리를 갱신하여 UI에 최신 데이터를 반영
    onSettled: () => afterMutationDetail(queryKey),
    onError: (err) => handleApiError(err, "useStore.create"),
  });

  /** 가게 수정 (Update) */
  const update = useMutation({
    mutationFn: storeAPI.update,
    // 수정 후 상세 쿼리를 갱신하여 UI에 최신 데이터를 반영
    onSettled: () => afterMutationDetail(queryKey),
    onError: (err) => handleApiError(err, "useStore.update"),
  });

  /** 가게 삭제 (Delete) */
  const remove = useMutation({
    mutationFn: storeAPI.remove,
    onSettled: async (data, error) => {
      // 삭제 후 상세 쿼리 캐시를 완전히 제거하고(useAfterMutation.DELETE),
      // 필요한 경우 목록 쿼리 키(listQueryKey)를 인자로 추가하여 목록 갱신을 지시할 수 있습니다.
      await afterMutationDelete(queryKey);
      console.log("[useStore] 가게 삭제 후처리 완료 → 캐시 및 상태 초기화");
    },
    onError: (err) => handleApiError(err, "useStore.remove"),
  });

  return {
    myStore,
    isLoading,
    isError,
    refetch,
    create,
    update,
    remove,
  };
}

export default useStore;
