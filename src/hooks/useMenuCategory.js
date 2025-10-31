import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menuCategoryAPI";

/**
 * React Query 기반 카테고리 관리 훅
 * - storeId별 카테고리 목록 캐싱 및 자동 갱신
 */
export const useMenuCategory = (storeId) => {
  const queryClient = useQueryClient();
  const queryKey = ["menuCategoryList", storeId];

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => menuCategoryAPI.getList(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 3, // 3분 캐시
  });

  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeCategory = useMutation({
    mutationFn: menuCategoryAPI.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    categories,
    isLoading,
    isError,
    createCategory,
    updateCategory,
    removeCategory,
    refetch,
  };
};
