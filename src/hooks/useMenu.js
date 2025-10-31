import { useMutation, useQueryClient } from "@tanstack/react-query";
import menuAPI from "@/service/menuAPI";
import { useCategoryStore } from "@/store/useCategoryStore";

/**
 * 메뉴 CRUD 훅 (React Query + Zustand 연동)
 * - 카테고리별 메뉴 등록/수정/삭제 후 자동 동기화
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
        // 구조 안전하게 복사해서 상태 갱신
        setActiveCategory(JSON.parse(JSON.stringify(updated)));
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
