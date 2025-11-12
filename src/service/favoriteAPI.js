import api from "@/api/axiosApi";
import { authStore } from "@/store/authStore";

/**
 * favoriteAPI
 * -------------------------------------------------
 * - 찜 관련 API 모듈
 * - add / remove / check / list
 */
const favoriteAPI = {
  /** 찜 등록 */
  async add(storeId) {
    const { userId } = authStore.getState();
    if (!userId) throw new Error("로그인이 필요합니다.");

    const { data } = await api.post("/api/v1/favorite", { userId, storeId });
    if (data.resultCode !== "200") throw new Error("찜 등록 실패");
    return data.response;
  },

  /** 찜 해제 */
  async remove(storeId) {
    const { data } = await api.delete(`/api/v1/favorite/store/${storeId}`);
    if (data.resultCode !== "200") throw new Error("찜 해제 실패");
    return data.response;
  },

  /** 특정 가게의 찜 여부 확인 */
  async check(storeId) {
    const { data } = await api.get(`/api/v1/favorite/store/${storeId}`);
    return data.response ?? false;
  },

  /** 내 찜 목록 조회 (주소 기반) */
  async list(page = 0, addr) {
    if (!addr) throw new Error("주소가 필요합니다.");

    const { data } = await api.get(`/api/v1/favorite`, {
      params: { page, addr },
    });

    if (data.resultCode !== "200") throw new Error("찜 목록 조회 실패");
    return data.response;
  },
};

export default favoriteAPI;
