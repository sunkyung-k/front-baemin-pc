import api from "@/api/axiosApi";

/**
 * Review Reply API
 * ------------------------------------------------------------
 * - 점주 리뷰 답글 등록 / 수정 / 삭제
 */
export const reviewReplyAPI = {
  /** 답글 등록 */
  create: async (payload) => {
    return await api.post("/api/v1/review/reply", payload);
  },

  /** 답글 수정 */
  update: async (payload) => {
    return await api.put("/api/v1/review/reply", payload);
  },

  /** 답글 삭제 */
  remove: async (reviewReplyId) => {
    return await api.delete(`/api/v1/review/reply/${reviewReplyId}`);
  },
};
