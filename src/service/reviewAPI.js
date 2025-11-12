import api from "@/api/axiosApi";

/**
 * Review API
 * ------------------------------------------------------------
 * - 리뷰 등록/수정: multipart/form-data 전송
 * - 리뷰 삭제: path variable
 * - 리뷰 조회: 일반 GET
 */
export const reviewAPI = {
  /** 리뷰 등록 */
  create: async (formData) => {
    return await api.post("/api/v1/review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 리뷰 수정 */
  update: async (formData) => {
    return await api.put("/api/v1/review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 리뷰 삭제 */
  remove: async (reviewId) => {
    return await api.delete(`/api/v1/review/${reviewId}`);
  },

  /** 내가 작성한 리뷰 리스트 */
  getMyReviews: async (params) => {
    return await api.get("/api/v1/review", { params });
  },

  /** 특정 가게 리뷰 리스트 (storeId 기반) */
  getStoreReviews: async (storeId, params) => {
    return await api.get(`/api/v1/review/store/${storeId}`, { params });
  },

  /** 내 가게 리뷰 리스트 (점주용) */
  getMyStoreReviews: async (params) => {
    return await api.get("/api/v1/review/store/my", { params });
  },
};
