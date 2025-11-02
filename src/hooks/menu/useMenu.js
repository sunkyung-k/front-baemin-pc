import { useMutation, useQueryClient } from "@tanstack/react-query";
import menuAPI from "@/service/menu/menuAPI";
import menuCategoryAPI from "@/service/menu/menuCategoryAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useCategoryStore } from "@/store/useCategoryStore";

/**
 *  메뉴 CRUD 훅 (React Query + Zustand 완전 동기화)
 * - 등록/수정/삭제 후: React Query 캐시와 Zustand activeCategory 동시에 갱신
 */
export const useMenu = (storeId) => {
  const queryClient = useQueryClient();
  const { activeCategory, setActiveCategory } = useCategoryStore();
  const queryKey = QUERY_KEYS.MENU_CATEGORY_LIST(storeId);

  /** 최신 목록으로 Query + Zustand 동시에 갱신 */
  const refreshAll = async () => {
    try {
      // 서버에서 최신 카테고리 목록 가져오기
      const freshList = await menuCategoryAPI.getList(storeId);

      // React Query 캐시 갱신
      queryClient.setQueryData(queryKey, freshList);

      // Zustand의 activeCategory도 최신 데이터로 교체
      if (activeCategory) {
        const updated = freshList.find(
          (cat) => cat.menuCaId === activeCategory.menuCaId
        );
        if (updated) {
          //  완전 새 객체로 덮어쓰기 (React 강제 렌더 트리거)
          setActiveCategory({ ...structuredClone(updated), storeId });
        }
      }
    } catch (err) {
      console.error("[useMenu] refreshAll error:", err);
    }
  };

  /** 메뉴 등록 */
  const create = useMutation({
    mutationFn: menuAPI.create,
    onSuccess: refreshAll,
  });

  /** 메뉴 수정 */
  const update = useMutation({
    mutationFn: menuAPI.update,
    onSuccess: refreshAll,
  });

  /** 메뉴 삭제 */
  const remove = useMutation({
    mutationFn: menuAPI.remove,
    onSuccess: refreshAll,
  });

  return { create, update, remove };
};

export default useMenu;
