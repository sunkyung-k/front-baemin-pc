import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/**
 * 메뉴 옵션 그룹 관련 API (v2 안정화)
 * -----------------------------------------
 * - handleApiError로 message 추출만 수행
 * - throw Error 제거 (상위 훅이 alert 처리)
 */
const menuOptionGroupAPI = {
  /** 메뉴 옵션 그룹 등록 */
  async create(payload) {
    try {
      const res = await api.post(`/api/v1/menu/group`, payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionGroupAPI.create");
    }
  },

  /** 메뉴 옵션 그룹 수정 */
  async update(payload) {
    try {
      const res = await api.put(`/api/v1/menu/group`, payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionGroupAPI.update");
    }
  },

  /** 메뉴 옵션 그룹 삭제 */
  async remove(menuOptGrpId) {
    try {
      const res = await api.delete(`/api/v1/menu/group/${menuOptGrpId}`);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionGroupAPI.remove");
    }
  },
};

export default menuOptionGroupAPI;
