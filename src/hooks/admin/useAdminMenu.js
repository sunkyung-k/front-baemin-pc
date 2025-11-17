import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminMenuAPI from "@/service/admin/adminMenuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";

export const useMenuAdmin = (storeId) => {
  const queryClient = useQueryClient();
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();

  /** 메뉴 삭제 */
  const removeMenu = useMutation({
    mutationFn: adminMenuAPI.removeMenu,
    onSuccess: (_, menuId) => {
      if (activeCategory?.menuList) {
        const updated = activeCategory.menuList.filter(
          (m) => m.menuId !== menuId
        );
        setActiveCategory({ ...activeCategory, menuList: updated });
      }

      queryClient.removeQueries({
        queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
        exact: true,
      });

      queryClient.invalidateQueries(QUERY_KEYS.STORE_DETAIL(storeId));
    },
  });

  /** 옵션 삭제 (관리자용) */
  const removeOption = useMutation({
    mutationFn: adminMenuAPI.removeMenuOption,
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.STORE_DETAIL(storeId));
    },
  });

  return { removeMenu, removeOption };
};

/** ⬅⬅⬅⬅⬅ 이거 반드시 있어야 함 */
export default useMenuAdmin;
