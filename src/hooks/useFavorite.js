import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import favoriteAPI from "@/service/favoriteAPI";
import { handleApiError } from "@/utills/handleApiError";

/**
 * useFavorite
 * -------------------------------------------------
 * - 찜 상태 확인 / 추가 / 삭제 / 캐시 동기화
 */
export default function useFavorite(storeId) {
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  /** 초기 찜 상태 확인 (야매 async → 함수 분리로 명시화) */
  useEffect(() => {
    if (!storeId) return;
    const fetchFavoriteState = async () => {
      try {
        const liked = await favoriteAPI.check(storeId);
        setIsLiked(liked);
      } catch {
        setIsLiked(false);
      }
    };
    fetchFavoriteState();
  }, [storeId]);

  /** 찜 토글 함수 */
  const toggleLike = useCallback(
    async (nextState) => {
      try {
        // 서버 반영
        if (nextState) await favoriteAPI.add(storeId);
        else await favoriteAPI.remove(storeId);

        // 로컬 상태 즉시 반영
        setIsLiked(nextState);

        // 관련 캐시 무효화 (Promise.all로 병렬 처리)
        await Promise.all([
          queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_LIST]),
          queryClient.invalidateQueries([QUERY_KEYS.STORE_DETAIL(storeId)]),
        ]);
      } catch (err) {
        handleApiError(err, "useFavorite");
      }
    },
    [storeId, queryClient]
  );

  return { isLiked, toggleLike };
}
