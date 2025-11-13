import api from "@/api/axiosApi";

/**
 * Review API (최신 안정형)
 * ------------------------------------------------------------
 * - create / update → multipart/form-data
 * - remove → path variable
 * - list → 일반 GET
 * - 모든 응답은 { resultCode, response, ... } 구조로 맞춤
 */
export const reviewAPI = {
  /** 리뷰 등록 (POST) */
  create: async (formData) => {
    const res = await api.post("/api/v1/review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.response ?? res.data; // 일관된 응답 보장
  },

  /** 리뷰 수정 (PUT) */
  update: async (formData) => {
    const res = await api.put("/api/v1/review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.response ?? res.data;
  },

  /** 리뷰 삭제 (DELETE) */
  remove: async (reviewId) => {
    const res = await api.delete(`/api/v1/review/${reviewId}`);
    return res.data?.response ?? res.data;
  },

  /** 내가 작성한 리뷰 목록 */
  getMyReviews: async (params) => {
    const res = await api.get("/api/v1/review", { params });
    return res.data;
  },

  /** 특정 가게 리뷰 목록 (storeId 기준) */
  getStoreReviews: async (storeId, params) => {
    const res = await api.get(`/api/v1/review/store/${storeId}`, { params });
    return res.data;
  },

  /** 내 가게 리뷰 목록 (점주용) */
  getMyStoreReviews: async (params) => {
    const res = await api.get("/api/v1/review/store/my", { params });
    return res.data;
  },
};
