import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { QUERY_KEYS } from "@/constants/queryKeys";
import favoriteAPI from "@/service/favoriteAPI";
import { authStore } from "@/store/authStore";
import { handleApiError } from "@/utills/handleApiError";

/**
 * useFavoriteToggle
 * -------------------------------------------------
 * - 찜 상태 확인 / 추가 / 삭제 / 캐시 동기화
 */
export default function useFavoriteToggle(storeId) {
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = authStore();

  /** 초기 찜 상태 확인 */
  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        const liked = await favoriteAPI.check(storeId);
        setIsLiked(liked);
      } catch {
        setIsLiked(false);
      }
    })();
  }, [storeId]);

  /** 찜 토글 함수 */
  const toggleLike = useCallback(
    async (nextState) => {
      // 로그인 안 되어 있으면 → alert + 로그인 이동
      if (!isAuthenticated()) {
        const confirmLogin = window.confirm(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동할까요?"
        );
        if (confirmLogin) navigate("/login");
        return;
      }

      try {
        if (nextState) {
          await favoriteAPI.add(storeId);
          alert("이 가게를 찜했습니다.\n찜 목록에서 확인할 수 있습니다.");
        } else {
          await favoriteAPI.remove(storeId);
          alert("찜을 해제했습니다.");
        }

        setIsLiked(nextState);

        // 캐시 무효화로 전체 페이지 동기화
        queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_LIST]);
        queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_DETAIL(storeId)]);
        queryClient.invalidateQueries([QUERY_KEYS.STORE_DETAIL(storeId)]);
      } catch (err) {
        handleApiError(err, "useFavoriteToggle");
      }
    },
    [storeId, queryClient, isAuthenticated, navigate]
  );

  return { isLiked, toggleLike };
}
