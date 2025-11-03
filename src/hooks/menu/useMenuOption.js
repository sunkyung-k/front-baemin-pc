import { useMutation } from "@tanstack/react-query";
import menuOptionAPI from "@/service/menu/menuOptionAPI";
import menuAPI from "@/service/menu/menuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useAfterMutation } from "@/hooks/common/useAfterMutation";

/**
 * 메뉴 옵션 CRUD 훅 (React Query + Zustand 완전 동기화형)
 * - 옵션 등록 / 수정 / 삭제 후 즉시 메뉴 상세 갱신
 */
export const useMenuOption = (menuId) => {
  const { activeCategory, setActiveCategory } = useCategoryStore();

  /** 메뉴 상세 재조회 후 Zustand 동기화 */
  const refreshMenu = async () => {
    if (!activeCategory || !menuId) return;

    try {
      // 최신 메뉴 상세 재요청
      const updatedMenu = await menuAPI.getMenuDetail(menuId);
      if (!updatedMenu) return;

      // 현재 카테고리 내 menuList에서 해당 메뉴만 교체
      const updatedList = (activeCategory.menuList ?? []).map((m) =>
        m.menuId === menuId ? updatedMenu : m
      );

      // Zustand 상태 교체 → 즉시 리렌더 유도
      setActiveCategory({
        ...activeCategory,
        menuList: updatedList,
      });
    } catch (err) {
      console.error("❌ [refreshMenu error]", err);
    }
  };

  /** React Query + Zustand 동기화 후처리 */
  const queryKey = QUERY_KEYS.MENU_DETAIL(menuId);
  const afterMutation = useAfterMutation("detail", refreshMenu);

  /** 옵션 등록 */
  const create = useMutation({
    mutationFn: menuOptionAPI.create,
    onSettled: () => afterMutation(queryKey),
  });

  /** 옵션 수정 */
  const update = useMutation({
    mutationFn: menuOptionAPI.update,
    onSettled: () => afterMutation(queryKey),
  });

  /** 옵션 삭제 */
  const remove = useMutation({
    mutationFn: menuOptionAPI.remove,
    onSettled: () => afterMutation(queryKey),
  });

  // refreshMenu 리턴 반드시 포함
  return { create, update, remove, refreshMenu };
};

export default useMenuOption;
