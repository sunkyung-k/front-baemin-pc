import { useMutation } from "@tanstack/react-query";
import menuOptionAPI from "@/service/menu/menuOptionAPI";
import menuAPI from "@/service/menu/menuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { AFTER_TYPES, useAfterMutation } from "@/hooks/common/useAfterMutation";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

/**
 * 메뉴 옵션 CRUD 훅 (React Query + Zustand 완전 동기화형)
 * -------------------------------------------------------
 * - 옵션 등록 / 수정 / 삭제 후 즉시 메뉴 상세 갱신
 * - 삭제 시 중복 confirm/alert 방지
 */
export const useMenuOption = (menuId) => {
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();

  /** 메뉴 상세 갱신 */
  const refreshMenu = async () => {
    if (!activeCategory || !menuId) return;
    try {
      const updatedMenu = await menuAPI.getMenuDetail(menuId);
      if (!updatedMenu) return;
      const updatedList = (activeCategory.menuList ?? []).map((m) =>
        m.menuId === menuId ? updatedMenu : m
      );
      setActiveCategory({ ...activeCategory, menuList: updatedList });
    } catch (err) {
      handleError(err, "useMenuOption.refreshMenu");
    }
  };

  const queryKey = QUERY_KEYS.MENU_DETAIL(menuId);
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, refreshMenu);

  /** 옵션 등록 */
  const create = useMutation({
    mutationFn: menuOptionAPI.create,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuOption.create"),
  });

  /** 옵션 수정 */
  const update = useMutation({
    mutationFn: menuOptionAPI.update,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuOption.update"),
  });

  /** 옵션 삭제 */
  const remove = useMutation({
    mutationFn: async (menuOptId) => {
      const { success } = await handleDelete(
        () => menuOptionAPI.remove(menuOptId),
        "useMenuOption.remove"
      );
      if (success) {
        await afterMutation(queryKey);
      }
    },
    onError: (err) => handleError(err, "useMenuOption.remove"),
  });

  return { create, update, remove, refreshMenu };
};

export default useMenuOption;
