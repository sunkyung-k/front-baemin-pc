import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import storeAPI from "@/service/storeAPI";

export const useStore = () => {
  const queryClient = useQueryClient();

  // ✅ 가게 리스트
  const {
    data: stores = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["storeList"],
    queryFn: storeAPI.fetchStoreList,
  });

  // ✅ 등록
  const createStore = useMutation({
    mutationFn: storeAPI.createStore,
    onSuccess: () => {
      queryClient.invalidateQueries(["storeList"]);
      alert("가게 등록이 완료되었습니다!");
    },
  });

  // ✅ 수정
  const updateStore = useMutation({
    mutationFn: storeAPI.updateStore,
    onSuccess: () => {
      queryClient.invalidateQueries(["storeList"]);
      alert("가게 정보가 수정되었습니다!");
    },
  });

  // ✅ 삭제 (Soft Delete)
  const removeStore = useMutation({
    mutationFn: storeAPI.removeStore,
    onSuccess: () => {
      queryClient.invalidateQueries(["storeList"]);
      alert("가게가 숨김 처리되었습니다!");
    },
  });

  return { stores, isLoading, isError, createStore, updateStore, removeStore, refetch };
};
