import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 옵션 그룹 관련 API */
const menuOptionGroupAPI = {
  /** 메뉴 옵션 그룹 등록 */
  async create(payload) {
    try {
      const res = await api.post(`/api/v1/menu/group`, payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      handleApiError(err, "menuOptionGroupAPI.create");
      throw err;
    }
  },

  /** 메뉴 옵션 그룹 수정 */
  async update(payload) {
    try {
      const res = await api.put(`/api/v1/menu/group`, payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      handleApiError(err, "menuOptionGroupAPI.update");
      throw err;
    }
  },

  /** 메뉴 옵션 그룹 삭제 */
  async remove(menuOptGrpId) {
    try {
      const res = await api.delete(`/api/v1/menu/group/${menuOptGrpId}`);
      return res.data?.response ?? res.data;
    } catch (err) {
      handleApiError(err, "menuOptionGroupAPI.remove");
      throw err;
    }
  },
};

export default menuOptionGroupAPI;
