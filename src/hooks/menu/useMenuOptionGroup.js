import { useMutation } from "@tanstack/react-query";
import menuOptionGroupAPI from "@/service/menu/menuOptionGroupAPI";
import menuAPI from "@/service/menu/menuAPI";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useHandleError } from "@/hooks/common/useHandleError";

export const useMenuOptionGroup = (menuId) => {
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();
  const handleError = useHandleError();

  /** 메뉴 상세 다시 불러오고 activeCategory 갱신 */
  const refreshMenu = async () => {
    if (!activeCategory || !menuId) return;

    try {
      const updatedMenu = await menuAPI.getMenuDetail(menuId);

      const newList = activeCategory.menuList.map((m) =>
        m.menuId === menuId ? updatedMenu : m
      );

      setActiveCategory({ ...activeCategory, menuList: newList });
    } catch (err) {
      handleError(err, "useMenuOptionGroup.refreshMenu");
    }
  };

  const create = useMutation({
    mutationFn: menuOptionGroupAPI.create,
  });

  const update = useMutation({
    mutationFn: menuOptionGroupAPI.update,
  });

  const remove = useMutation({
    mutationFn: menuOptionGroupAPI.remove,
  });

  return { create, update, remove, refreshMenu };
};
