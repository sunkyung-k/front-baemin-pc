import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useReviewUpdate
 * -------------------------------------------------
 * - 리뷰 수정 시: React Query 캐시 즉시 반영 + 서버 invalidate
 * - 리뷰 삭제 시: 리스트에서 즉시 제거 + 서버 invalidate
 * - create 훅과 완전히 분리되어, 등록 로직에 영향 없음
 */
export const useReviewUpdate = () => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  /** 리뷰 수정 */
  const updateReview = useMutation({
    mutationFn: reviewAPI.update,
    onSuccess: async (_, formData) => {
      const reviewId = Number(formData.get("reviewId"));
      console.info("리뷰 수정 성공:", reviewId);

      // React Query 캐시 즉시 갱신 (수정된 리뷰 내용 반영)
      queryClient.setQueryData([QUERY_KEYS.MY_REVIEW_LIST], (prev) => {
        if (!prev) return prev;
        const response =
          prev?.response ??
          prev?.data?.response ??
          prev?.data?.data?.response ??
          null;
        if (!response?.content) return prev;

        const updatedContent = response.content.map((r) =>
          r.reviewId === reviewId
            ? { ...r, updateDate: new Date().toISOString() } // 변경 시점 반영
            : r
        );
        const newResponse = { ...response, content: [...updatedContent] };
        return { ...prev, response: newResponse };
      });

      // 서버 데이터 최신화
      await queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]);
    },
    onError: (err) => handleError(err, "useReviewUpdate.updateReview"),
  });

  /** 리뷰 삭제 */
  const deleteReview = useMutation({
    mutationFn: reviewAPI.remove,
    onSuccess: async (_, reviewId) => {
      console.info("리뷰 삭제 성공:", reviewId);

      // 캐시에서 리뷰 즉시 제거
      queryClient.setQueryData([QUERY_KEYS.MY_REVIEW_LIST], (prev) => {
        if (!prev) return prev;
        const response =
          prev?.response ??
          prev?.data?.response ??
          prev?.data?.data?.response ??
          null;
        if (!response?.content) return prev;

        const filteredContent = response.content.filter(
          (r) => r.reviewId !== reviewId
        );
        const newResponse = { ...response, content: [...filteredContent] };
        return { ...prev, response: newResponse };
      });

      // 서버 최신화
      await queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]);
    },
    onError: (err) => handleError(err, "useReviewUpdate.deleteReview"),
  });

  return { updateReview, deleteReview };
};
