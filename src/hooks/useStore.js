import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import storeAPI from "@/service/storeAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useStoreInfoStore } from "@/store/useStoreInfoStore";
import { handleApiError } from "@/utills/handleApiError";

/**
 * - storeAPI + React Query + Zustand 통합
 * - 캐시 기반 자동 업데이트 / 삭제 처리
 * - UI 레벨에서는 myStore만 바라보면 됨
 */
export function useStore() {
  const queryClient = useQueryClient();
  const { setMyStore, clearMyStore } = useStoreInfoStore();

  /** 내 가게 조회 (React Query) */
  const {
    data: myStore,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.MY_STORE,
    queryFn: storeAPI.getMyStore,
    onSuccess: (data) => {
      if (data) {
        setMyStore(data);
        console.log("[useStore] 내 가게 불러오기 성공:", data);
      } else {
        clearMyStore();
        console.log("[useStore] 가게 정보 없음 (storeId 미보유)");
      }
    },
    onError: (err) => handleApiError(err, "useStore.getMyStore"),
  });

  /** 공통 새로고침 (invalidate + refetch) */
  const refreshStore = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_STORE });
    await refetch();
  };

  /** 가게 등록 */
  const create = useMutation({
    mutationFn: (formData) => storeAPI.create(formData),
    onSuccess: async () => {
      await refreshStore();
      console.log("[useStore] 가게 등록 완료");
    },
    onError: (err) => handleApiError(err, "useStore.create"),
  });

  /** 가게 수정 */
  const update = useMutation({
    mutationFn: (formData) => storeAPI.update(formData),
    onSuccess: async () => {
      await refreshStore();
      console.log("[useStore] 가게 정보 수정 완료");
    },
    onError: (err) => handleApiError(err, "useStore.update"),
  });

  /** 가게 삭제 */
  const remove = useMutation({
    mutationFn: (storeId) => storeAPI.remove(storeId),
    onSuccess: async () => {
      clearMyStore();
      queryClient.removeQueries(QUERY_KEYS.MY_STORE, { exact: true });
      console.log("[useStore] 가게 삭제 완료");
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
    refreshStore,
  };
}

export default useStore;
