import { useMutation, useQueryClient } from "@tanstack/react-query";
import menuAPI from "@/service/menu/menuAPI";
import menuCategoryAPI from "@/service/menu/menuCategoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

export const useMenu = (storeId) => {
  const queryClient = useQueryClient();
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();
  const queryKey = QUERY_KEYS.MENU_CATEGORY_LIST(storeId);
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();

  /** 최신 목록으로 Query + Zustand 동시에 갱신 */
  const refreshAll = async () => {
    try {
      const freshList = await menuCategoryAPI.getList(storeId);
      queryClient.setQueryData(queryKey, freshList);

      if (activeCategory) {
        const updated = freshList.find(
          (cat) => cat.menuCaId === activeCategory.menuCaId
        );
        if (updated) {
          setActiveCategory({ ...structuredClone(updated), storeId });
        }
      }

      // StoreDetailLayout 갱신
      queryClient.invalidateQueries(QUERY_KEYS.STORE_DETAIL(storeId));
    } catch (err) {
      handleError(err, "useMenu.refreshAll");
    }
  };

  /** 메뉴 등록 */
  const create = useMutation({
    mutationFn: menuAPI.create,
    onSuccess: refreshAll,
    onError: (err) => handleError(err, "useMenu.create"),
  });

  /** 메뉴 수정 */
  const update = useMutation({
    mutationFn: menuAPI.update,
    onSuccess: refreshAll,
    onError: (err) => handleError(err, "useMenu.update"),
  });

  /** 메뉴 삭제 */
  const remove = useMutation({
    mutationFn: async (menuId) => {
      const { success } = await handleDelete(
        () => menuAPI.remove(menuId),
        "useMenu.remove"
      );
      if (success) await refreshAll();
    },
  });

  /** 메뉴 복사 */
  const copy = useMutation({
    mutationFn: (menuId) => menuAPI.copy(menuId),
    onSuccess: refreshAll,
    onError: (err) => handleError(err, "useMenu.copy"),
  });

  return { create, update, remove, copy };
};

export default useMenu;
