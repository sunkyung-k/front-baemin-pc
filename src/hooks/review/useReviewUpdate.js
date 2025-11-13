import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useReviewStore } from "@/store/useReviewStore";

/**
 * useReviewUpdate
 * -------------------------------------------------
 * - 리뷰 수정 시: React Query 캐시 + Zustand 동기화
 * - 리뷰 삭제 시: 리스트에서 즉시 제거
 */
export const useReviewUpdate = () => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();
  const { updateReviewLocal, removeReviewLocal } = useReviewStore();

  /** 리뷰 수정 */
  const updateReview = useMutation({
    mutationFn: reviewAPI.update,
    onSuccess: async (_, formData) => {
      const reviewId = Number(formData.get("reviewId"));
      console.info("리뷰 수정 성공:", reviewId);

      // 로컬 즉시 반영 (이미지 URL이 응답에 없으므로 수정일자만 갱신)
      updateReviewLocal({
        reviewId,
        updateDate: new Date().toISOString(),
      });

      // React Query invalidate
      // 이 요청이 완료되어야 갱신된 이미지가 포함된 데이터가 다시 로드됩니다.
      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_ORDER_LIST]),
      ]);
    },
    onError: (err) => handleError(err, "useReviewUpdate.updateReview"),
  });

  /** 리뷰 삭제 */
  const removeReview = useMutation({
    mutationFn: reviewAPI.remove,
    onSuccess: async (_, reviewId) => {
      console.info("리뷰 삭제 성공:", reviewId);
      removeReviewLocal(reviewId);
      await queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]);
    },
    onError: (err) => handleError(err, "useReviewUpdate.removeReview"),
  });

  return { updateReview, removeReview };
};
