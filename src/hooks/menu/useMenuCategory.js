import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menu/menuCategoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation } from "@/hooks/common/useAfterMutation";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

export const useMenuCategory = (storeId) => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.MENU_CATEGORY_LIST(storeId);
  const afterMutation = useAfterMutation("list");
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();
  const { activeCategory, setActiveCategory, clearActiveCategory } =
    useMenuCategoryStore();

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

  const invalidateStoreDetail = () =>
    queryClient.invalidateQueries(QUERY_KEYS.STORE_DETAIL(storeId));

  /** 등록 */
  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSuccess: () => {
      afterMutation(queryKey);
      invalidateStoreDetail();
    },
    onError: (err) => handleError(err, "useMenuCategory.create"),
  });

  /** 수정 */
  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSuccess: () => {
      afterMutation(queryKey);
      invalidateStoreDetail();
    },
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
        invalidateStoreDetail();
        if (activeCategory?.menuCaId === menuCaId) {
          clearActiveCategory();
        }
      }
    },
    onError: (err) => handleError(err, "useMenuCategory.remove"),
  });

  const selectCategory = (category) => {
    setActiveCategory({
      menuCaId: category?.menuCaId,
      menuCaName: category?.menuCaName,
      storeId,
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
