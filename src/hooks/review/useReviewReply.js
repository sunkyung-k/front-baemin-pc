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
    mutationFn: ({ reviewReplyId }) => reviewReplyAPI.remove(reviewReplyId),

    onSuccess: async (_, { reviewReplyId, reviewId }) => {
      // 즉시 화면 반영될 수 있게 reply 객체를 완전히 새로 생성
      updateReviewLocal({
        reviewId,
        reply: {
          reviewReplyId,
          content: "",
          delYn: "Y",
        },
      });

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
