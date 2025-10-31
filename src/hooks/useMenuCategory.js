import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menuCategoryAPI";

/**
 * 메뉴 카테고리 관리 훅 (React Query 기반)
 * - storeId별 데이터 캐싱 및 자동 invalidate
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
    staleTime: 1000 * 60 * 3, // 3분 캐싱
  });

  /** 등록 */
  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  /** 수정 */
  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  /** 삭제 */
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
