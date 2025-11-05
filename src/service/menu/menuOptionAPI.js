import api from "@/api/axiosApi";

/** 메뉴 옵션 관련 API */
const menuOptionAPI = {
  /** 옵션 등록 */
  async create(payload) {
    const res = await api.post("/api/v1/menu/option", payload);
    return res.data?.response ?? res.data;
  },

  /** 옵션 수정 */
  async update(payload) {
    const res = await api.put("/api/v1/menu/option", payload);
    return res.data?.response ?? res.data;
  },

  /** 옵션 삭제 */
  async remove(menuOptId) {
    const res = await api.delete(`/api/v1/menu/option/${menuOptId}`);
    return res.data?.response ?? res.data;
  },
};

export default menuOptionAPI;
