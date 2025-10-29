// ✅ 수정된 useMenuCategory.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menuCategoryAPI";

export const useMenuCategory = (storeId) => {
  const queryClient = useQueryClient();

  // ✅ 목록
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch, // ✅ refetch 추가
  } = useQuery({
    queryKey: ["menuCategoryList", storeId],
    queryFn: () => menuCategoryAPI.getList(storeId),
    enabled: !!storeId,
  });

  // ✅ 등록
  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSuccess: () =>
      queryClient.invalidateQueries(["menuCategoryList", storeId]),
  });

  // ✅ 수정
  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSuccess: () =>
      queryClient.invalidateQueries(["menuCategoryList", storeId]),
  });

  // ✅ 삭제
  const deleteCategory = useMutation({
    mutationFn: menuCategoryAPI.remove,
    onSuccess: () =>
      queryClient.invalidateQueries(["menuCategoryList", storeId]),
  });

  return {
    categories,
    isLoading,
    isError,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch, // ✅ 이제 CategoryPanel에서 안전하게 호출 가능
  };
};
