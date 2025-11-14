import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReviewAPI } from "@/service/admin/adminReviewAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useAdminReview (관리자 전용 리뷰/답변 삭제 통합 훅)
 * -----------------------------------------------------
 * - reviewDelete: 리뷰 삭제
 * - replyDelete: 리뷰 답변 삭제
 * - 사용 예: const { reviewDelete, replyDelete } = useAdminReview();
 */
export function useAdminReview() {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  /** 리뷰 삭제 */
  const reviewDelete = useMutation({
    mutationFn: (reviewId) => adminReviewAPI.removeReview(reviewId),

    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]);
      queryClient.invalidateQueries([QUERY_KEYS.STORE_REVIEW_LIST]);
    },

    onError: (err) => handleError(err, "admin.review.delete"),
  });

  /** 리뷰 답변 삭제 */
  const replyDelete = useMutation({
    mutationFn: (reviewReplyId) => adminReviewAPI.removeReply(reviewReplyId),

    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]);
      queryClient.invalidateQueries([QUERY_KEYS.STORE_REVIEW_LIST]);
    },

    onError: (err) => handleError(err, "admin.review.reply.delete"),
  });

  return { reviewDelete, replyDelete };
}
