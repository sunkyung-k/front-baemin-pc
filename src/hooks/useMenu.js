import { useMutation, useQueryClient } from "@tanstack/react-query";
import menuAPI from "@/service/menuAPI";
import { useCategoryStore } from "@/store/useCategoryStore";

/**
 * 메뉴 CRUD 및 카테고리 상태 갱신 훅
 * React Query + Zustand 연동 구조
 */
export const useMenu = (storeId) => {
  const queryClient = useQueryClient();
  const { activeCategory, setActiveCategory } = useCategoryStore();

  const refreshActiveCategory = async () => {
    await queryClient.refetchQueries(["menuCategoryList", storeId]);
    const newData = queryClient.getQueryData(["menuCategoryList", storeId]);

    if (newData && activeCategory) {
      const updated = newData.find(
        (cat) => cat.menuCaId === activeCategory.menuCaId
      );
      if (updated) {
        setActiveCategory(JSON.parse(JSON.stringify(updated))); // 강제 리렌더
      }
    }
  };

  const create = useMutation({
    mutationFn: menuAPI.create,
    onSuccess: refreshActiveCategory,
  });

  const update = useMutation({
    mutationFn: menuAPI.update,
    onSuccess: refreshActiveCategory,
  });

  const remove = useMutation({
    mutationFn: menuAPI.remove,
    onSuccess: refreshActiveCategory,
  });

  return { create, update, remove };
};
