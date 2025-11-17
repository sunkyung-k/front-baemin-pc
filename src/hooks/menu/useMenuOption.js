import { useMutation, useQueryClient } from "@tanstack/react-query";
import menuOptionAPI from "@/service/menu/menuOptionAPI";
import menuAPI from "@/service/menu/menuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { AFTER_TYPES, useAfterMutation } from "@/hooks/common/useAfterMutation";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

export const useMenuOption = (menuId) => {
  const queryClient = useQueryClient();
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();

  const storeId = activeCategory?.storeId;

  const refreshMenu = async () => {
    if (!activeCategory || !menuId) return;
    try {
      const updatedMenu = await menuAPI.getMenuDetail(menuId);
      if (!updatedMenu) return;
      const updatedList = (activeCategory.menuList ?? []).map((m) =>
        m.menuId === menuId ? updatedMenu : m
      );
      setActiveCategory({ ...activeCategory, menuList: updatedList });

      if (storeId) {
        queryClient.invalidateQueries(QUERY_KEYS.STORE_DETAIL(storeId)); // ⭐
      }
    } catch (err) {
      handleError(err, "useMenuOption.refreshMenu");
    }
  };

  const queryKey = QUERY_KEYS.MENU_DETAIL(menuId);
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, refreshMenu);

  const create = useMutation({
    mutationFn: menuOptionAPI.create,
    onSuccess: async () => {
      await afterMutation(queryKey);
    },
    onError: (err) => handleError(err, "useMenuOption.create"),
  });

  const update = useMutation({
    mutationFn: menuOptionAPI.update,
    onSuccess: async () => {
      await afterMutation(queryKey);
    },
    onError: (err) => handleError(err, "useMenuOption.update"),
  });

  const remove = useMutation({
    mutationFn: async (menuOptId) => {
      const { success } = await handleDelete(
        () => menuOptionAPI.remove(menuOptId),
        "useMenuOption.remove"
      );
      if (success) await afterMutation(queryKey);
    },
    onError: (err) => handleError(err, "useMenuOption.remove"),
  });

  return { create, update, remove, refreshMenu };
};

export default useMenuOption;
