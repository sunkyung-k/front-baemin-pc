import { useMutation } from "@tanstack/react-query";
import menuOptionGroupAPI from "@/service/menu/menuOptionGroupAPI";
import menuAPI from "@/service/menu/menuAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useAfterMutation } from "@/hooks/common/useAfterMutation";

/**
 * 메뉴 옵션 그룹 CRUD 훅 (React Query + Zustand 완전 동기화형)
 * - React Query: 서버 최신 데이터 refetch
 * - Zustand: activeCategory.menuList 즉시 반영
 */
export const useMenuOptionGroup = (menuId) => {
  const { activeCategory, setActiveCategory } = useCategoryStore();

  /** 메뉴 상세 최신화 후 Zustand에 즉시 반영 */
  const refreshMenu = async () => {
    if (!activeCategory || !menuId) return;

    try {
      // 최신 메뉴 상세 재조회
      const updatedMenu = await menuAPI.getMenuDetail(menuId);
      if (!updatedMenu) return;

      // 현재 카테고리의 메뉴리스트 중 대상 메뉴만 교체
      const updatedList = (activeCategory.menuList ?? []).map((m) =>
        m.menuId === menuId ? updatedMenu : m
      );

      // Zustand에 새 객체로 반영 (React 즉시 렌더 유도)
      setActiveCategory({
        ...activeCategory,
        menuList: updatedList,
      });
    } catch (err) {
      console.error("[refreshMenu] error:", err);
    }
  };

  /** React Query + Zustand 동기화 훅 */
  const queryKey = QUERY_KEYS.MENU_DETAIL(menuId);
  const afterMutation = useAfterMutation("detail", refreshMenu);

  /** 옵션 그룹 등록 */
  const create = useMutation({
    mutationFn: menuOptionGroupAPI.create,
    onSettled: () => afterMutation(queryKey),
  });

  /** 옵션 그룹 수정 */
  const update = useMutation({
    mutationFn: menuOptionGroupAPI.update,
    onSettled: () => afterMutation(queryKey),
  });

  /** 옵션 그룹 삭제 */
  const remove = useMutation({
    mutationFn: menuOptionGroupAPI.remove,
    onSettled: () => afterMutation(queryKey),
  });

  // refreshMenu까지 반드시 리턴
  return { create, update, remove, refreshMenu };
};

export default useMenuOptionGroup;
