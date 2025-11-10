import api from "@/api/axiosApi";
import { authStore } from "@/store/authStore";

const favoriteAPI = {
  /** 찜 등록 */
  async add(storeId) {
    const userId = authStore.getState().userId;
    if (!userId) throw new Error("로그인이 필요합니다.");

    const res = await api.post("/api/v1/favorite", { userId, storeId });
    if (res.data.resultCode !== "200") throw new Error("찜 등록 실패");
    return res.data.response;
  },

  /** 찜 해제 */
  async remove(storeId) {
    const res = await api.delete(`/api/v1/favorite/store/${storeId}`);
    if (res.data.resultCode !== "200") throw new Error("찜 해제 실패");
    return res.data.response;
  },

  /** 찜 여부 확인 */
  async check(storeId) {
    const res = await api.get(`/api/v1/favorite/store/${storeId}`);
    return res.data.response ?? false;
  },

  /** 내 찜 목록 조회 */
  async list(page = 0) {
    const res = await api.get(`/api/v1/favorite`, { params: { page } });
    if (res.data.resultCode !== "200") throw new Error("찜 목록 조회 실패");
    return res.data.response;
  },
};

export default favoriteAPI;
