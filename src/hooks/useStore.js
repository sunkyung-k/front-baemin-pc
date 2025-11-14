import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

export function useStore() {
  const queryClient = useQueryClient();
  const userId = authStore((s) => s.userId);
  const queryKey = [QUERY_KEYS.MY_STORE, userId];

  // 등록/수정 후 상세 데이터 갱신
  const afterMutationDetail = useAfterMutation(AFTER_TYPES.DETAIL, null, {
    scrollTop: true,
  });

  // 삭제 후 storeId 초기화는 여기서만 처리
  const afterMutationDelete = useAfterMutation(
    AFTER_TYPES.DELETE,
    () => authStore.getState().clearStoreId(),
    { scrollTop: true }
  );

  // 내 가게 조회
  const { data: myStore, refetch } = useQuery({
    queryKey,
    queryFn: storeAPI.getMyStore,
    enabled: !!userId,
    onError: (err) => handleApiError(err, "useStore.getMyStore"),
  });

  // 가게 등록
  const create = useMutation({
    mutationFn: storeAPI.create,
    onSettled: () => afterMutationDetail(queryKey),
    onError: (err) => handleApiError(err, "useStore.create"),
  });

  // 가게 수정
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

  // 가게 삭제
  const remove = useMutation({
    mutationFn: storeAPI.remove,
    onSettled: () => {
      afterMutationDelete(queryKey);
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
