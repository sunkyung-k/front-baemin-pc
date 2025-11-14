import api from "@/api/axiosApi";

/**
 * Admin Review API (관리자 전용)
 * ---------------------------------------------------------
 * - 리뷰 삭제
 * - 리뷰 답글 삭제
 * - 관리자 권한 필요
 */
export const adminReviewAPI = {
  /** 유저 리뷰 삭제 */
  removeReview: async (reviewId) => {
    const res = await api.delete(`/api/v1/admin/review/${reviewId}`);
    return res.data?.response ?? res.data;
  },

  /** 점주 답변 삭제 */
  removeReply: async (reviewReplyId) => {
    const res = await api.delete(`/api/v1/admin/review/reply/${reviewReplyId}`);
    return res.data?.response ?? res.data;
  },
};
