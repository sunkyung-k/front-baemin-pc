// src/hooks/review/useReviewReply.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewReplyAPI } from "@/service/reviewReplyAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useReviewStore } from "@/store/useReviewStore";

export const useReviewReply = () => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();
  const { updateReviewLocal } = useReviewStore();

  /** 등록 */
  const createReply = useMutation({
    mutationFn: reviewReplyAPI.create,
    onSuccess: async (_, payload) => {
      // ✅ 로컬 즉시 반영
      updateReviewLocal({
        reviewId: payload.reviewId,
        reply: payload,
      });

      // ✅ 캐시 invalidate 대상 확대
      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_STORE_REVIEW_LIST]), // 점주용
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]), // 유저용
        queryClient.invalidateQueries([QUERY_KEYS.STORE_REVIEW_LIST]), // 가게상세용
      ]);
    },
    onError: (err) => handleError(err, "useReviewReply.create"),
  });

  /** 수정 */
  const updateReply = useMutation({
    mutationFn: reviewReplyAPI.update,
    onSuccess: async (_, payload) => {
      updateReviewLocal({
        reviewId: payload.reviewId,
        reply: payload,
      });

      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_STORE_REVIEW_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.STORE_REVIEW_LIST]),
      ]);
    },
    onError: (err) => handleError(err, "useReviewReply.update"),
  });

  /** 삭제 */
  const removeReply = useMutation({
    mutationFn: reviewReplyAPI.remove,
    onSuccess: async (_, replyId) => {
      updateReviewLocal({ reply: null });

      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_STORE_REVIEW_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.STORE_REVIEW_LIST]),
      ]);
    },
    onError: (err) => handleError(err, "useReviewReply.remove"),
  });

  return { createReply, updateReply, removeReply };
};
