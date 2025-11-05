import api from "@/api/axiosApi";

/** 메뉴 옵션 그룹 관련 API */
const menuOptionGroupAPI = {
  /** 옵션 그룹 등록 */
  async create(payload) {
    const res = await api.post(`/api/v1/menu/group`, payload);
    return res.data?.response ?? res.data;
  },

  /** 옵션 그룹 수정 */
  async update(payload) {
    const res = await api.put(`/api/v1/menu/group`, payload);
    return res.data?.response ?? res.data;
  },

  /** 옵션 그룹 삭제 */
  async remove(menuOptGrpId) {
    const res = await api.delete(`/api/v1/menu/group/${menuOptGrpId}`);
    return res.data?.response ?? res.data;
  },
};

export default menuOptionGroupAPI;
