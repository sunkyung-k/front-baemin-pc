import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menu/menuCategoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation } from "@/hooks/common/useAfterMutation";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

/**
 * 메뉴 카테고리 CRUD 훅
 * - React Query: 서버 데이터 (목록, 캐싱)
 * - Zustand: UI 상태 (선택된 카테고리만)
 */
export const useMenuCategory = (storeId) => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.MENU_CATEGORY_LIST(storeId);
  const afterMutation = useAfterMutation("list");
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();
  const { activeCategory, setActiveCategory, clearActiveCategory } =
    useMenuCategoryStore();

  /** 메뉴 카테고리 목록 조회 */
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => menuCategoryAPI.getList(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 3,
  });

  /** 등록 */
  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuCategory.create"),
  });

  /** 수정 */
  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuCategory.update"),
  });

  /** 삭제 */
  const removeCategory = useMutation({
    mutationFn: async (menuCaId) => {
      const { success } = await handleDelete(
        () => menuCategoryAPI.remove(menuCaId),
        "useMenuCategory.remove"
      );
      if (success) {
        await afterMutation(queryKey);
        // 삭제된 카테고리라면 선택 해제
        if (activeCategory?.menuCaId === menuCaId) {
          clearActiveCategory();
        }
      }
    },
    onError: (err) => handleError(err, "useMenuCategory.remove"),
  });

  /** 카테고리 선택 */
  const selectCategory = (category) => {
    setActiveCategory({
      menuCaId: category?.menuCaId,
      menuCaName: category?.menuCaName,
    });
  };

  return {
    categories,
    isLoading,
    isError,
    createCategory,
    updateCategory,
    removeCategory,
    refetch,
    selectCategory,
    activeCategory,
  };
};

export default useMenuCategory;
