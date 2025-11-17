import api from "@/api/axiosApi";

const adminStoreAPI = {
  /** 관리자: 전체 가게 리스트 조회 */
  async getList(params = {}) {
    try {
      const res = await api.get("/api/v1/admin/store", { params });
      return res.data.response;
    } catch (err) {
      console.error("관리자 가게 리스트 조회 실패:", err);
      return { content: [], pageInfo: null };
    }
  },

  /** 관리자: 가게 영업 상태 변경 */
  async updateStatus({ storeId, closeYn }) {
    return api.put("/api/v1/admin/store/status", { storeId, closeYn });
  },

  /** 관리자: 가게 삭제 */
  async delete(storeId) {
    return api.delete(`/api/v1/admin/store/${storeId}`);
  },
};

export default adminStoreAPI;
