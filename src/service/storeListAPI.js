import api from "@/api/axiosApi";

/**
 * 가게 리스트 / 상세 조회 (유저 전용)
 * -------------------------------------------------
 * 변경 요약:
 * 1. try/catch 제거 (에러는 React Query 레벨에서 처리)
 * 2. handleApiError 제거
 * 3. 개발 모드에서만 console.log 활성화
 * 4. response 구조 (response.content, response.vo) 정확히 매핑
 */
const storeListAPI = {
  /** 📋 가게 리스트 조회 (검색/카테고리 필터 포함) */
  async getStores(params = {}) {
    const res = await api.get("/api/v1/store", { params });

    const data = res.data?.response?.content ?? [];

    if (import.meta.env.MODE === "development") {
      console.log("[storeListAPI] getStores 응답:", data);
    }

    return data;
  },

  /** 🏪 단일 가게 상세 조회 */
  async getStoreDetail(storeId) {
    const res = await api.get(`/api/v1/store/${storeId}`);
    const data = res.data?.response?.vo ?? res.data?.response ?? null;

    if (import.meta.env.MODE === "development") {
      console.log(`[storeListAPI] getStoreDetail(${storeId}) 응답:`, data);
    }

    return data;
  },
};

export default storeListAPI;
