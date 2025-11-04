import { useMutation } from "@tanstack/react-query";
import menuOptionGroupAPI from "@/service/menu/menuOptionGroupAPI";
import menuAPI from "@/service/menu/menuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { AFTER_TYPES, useAfterMutation } from "@/hooks/common/useAfterMutation";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

/**
 * 메뉴 옵션 그룹 CRUD 훅 (React Query + Zustand 완전 동기화형)
 * ----------------------------------------------------------
 * - 등록/수정 후: React Query + Zustand 상태 최신화
 * - 삭제 시: confirm + alert + 캐시 무효화 (중복 방지)
 */
export const useMenuOptionGroup = (menuId) => {
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
      handleError(err, "useMenuOptionGroup.refreshMenu");
    }
  };

  const queryKey = QUERY_KEYS.MENU_DETAIL(menuId);
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, refreshMenu);

  /** 옵션 그룹 등록 */
  const create = useMutation({
    mutationFn: menuOptionGroupAPI.create,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuOptionGroup.create"),
  });

  /** 옵션 그룹 수정 */
  const update = useMutation({
    mutationFn: menuOptionGroupAPI.update,
    onSuccess: () => afterMutation(queryKey),
    onError: (err) => handleError(err, "useMenuOptionGroup.update"),
  });

  /** 옵션 그룹 삭제 (중복 confirm 방지) */
  const remove = useMutation({
    mutationFn: async (menuOptGrpId) => {
      const { success } = await handleDelete(
        () => menuOptionGroupAPI.remove(menuOptGrpId),
        "useMenuOptionGroup.remove"
      );
      if (success) {
        await afterMutation(queryKey);
      }
    },
    onError: (err) => handleError(err, "useMenuOptionGroup.remove"),
  });

  return { create, update, remove, refreshMenu };
};

export default useMenuOptionGroup;
