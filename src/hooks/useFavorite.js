import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import favoriteAPI from "@/service/favoriteAPI";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/**
 * useFavorite
 * -------------------------------------------------
 * - 개별 가게 찜 상태 관리 훅
 * - 찜 등록/해제 + React Query 캐시 동기화
 * - 비회원은 API 호출하지 않도록 방어 처리
 */
export default function useFavorite(storeId) {
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = authStore((s) => s.isAuthenticated)();

  /**
   * 초기 찜 상태 조회
   * storeId 변경 시마다 API 요청 → 찜 여부 동기화
   */
  useEffect(() => {
    if (!storeId) return;

    // 비회원이면 favorite 체크 API 호출하면 안 됨
    if (!isAuthenticated) {
      setIsLiked(false);
      return;
    }

    const fetchFavoriteState = async () => {
      try {
        const liked = await favoriteAPI.check(storeId);
        setIsLiked(liked);
      } catch {
        setIsLiked(false); // 오류 시 안전하게 false로 초기화
      }
    };

    fetchFavoriteState();
  }, [storeId, isAuthenticated]);

  /**
   * 찜 토글 핸들러
   * - API 호출 후 로컬 상태와 캐시 동기화
   * - useCallback으로 재생성 최소화
   */
  const toggleLike = useCallback(
    async (nextState) => {
      if (!storeId) return;

      // 비회원이면 찜 기능 자체를 막음
      if (!isAuthenticated) {
        alert("로그인 후 이용 가능한 기능입니다.");
        return;
      }

      try {
        // 서버에 찜 상태 반영
        nextState
          ? await favoriteAPI.add(storeId)
          : await favoriteAPI.remove(storeId);

        // 로컬 즉시 반영 → UX 부드럽게
        setIsLiked(nextState);

        // 관련 캐시 무효화 → 목록/상세 자동 갱신
        await Promise.all([
          queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_LIST]),
          queryClient.invalidateQueries([QUERY_KEYS.STORE_DETAIL(storeId)]),
        ]);
      } catch (err) {
        handleApiError(err, "useFavorite");
      }
    },
    [storeId, queryClient, isAuthenticated]
  );

  return { isLiked, toggleLike };
}
