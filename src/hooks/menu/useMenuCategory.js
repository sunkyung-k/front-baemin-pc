import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import menuCategoryAPI from "@/service/menu/menuCategoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation } from "@/hooks/menu/useAfterMutation";
import { useCategoryStore } from "@/store/useCategoryStore";

/**
 * 메뉴 카테고리 CRUD 훅
 * - React Query: 서버 데이터 (목록, 캐싱)
 * - Zustand: UI 상태 (선택된 카테고리만)
 */
export const useMenuCategory = (storeId) => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.MENU_CATEGORY_LIST(storeId);
  const afterMutation = useAfterMutation("list");

  /** UI 상태 (현재 선택된 카테고리) */
  const { activeCategory, setActiveCategory, clearActiveCategory } =
    useCategoryStore();

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
    staleTime: 1000 * 60 * 3, // 3분 캐싱
  });

  /** 카테고리 등록 */
  const createCategory = useMutation({
    mutationFn: menuCategoryAPI.create,
    onSettled: () => afterMutation(queryKey),
  });

  /** 카테고리 수정 */
  const updateCategory = useMutation({
    mutationFn: menuCategoryAPI.update,
    onSettled: () => afterMutation(queryKey),
  });

  /** 카테고리 삭제 */
  const removeCategory = useMutation({
    mutationFn: menuCategoryAPI.remove,
    onSettled: () => {
      afterMutation(queryKey);
      // 현재 선택된 카테고리를 삭제한 경우 UI 상태 초기화
      if (activeCategory?.menuCaId) {
        const isDeleted = categories.some(
          (c) => c.menuCaId === activeCategory.menuCaId
        );
        if (isDeleted) clearActiveCategory();
      }
    },
  });

  /** 카테고리 선택 (UI 전용) */
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
    selectCategory, // 카테고리 선택 핸들러
    activeCategory, // 현재 선택된 카테고리
  };
};

export default useMenuCategory;
