import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/**
 * 메뉴 옵션 관련 API (v2 안정화)
 * -----------------------------------------
 * - handleApiError로 message 추출만 수행
 * - throw Error 제거 (상위 훅에서 alert 처리)
 */
const menuOptionAPI = {
  /** 옵션 등록 */
  async create(payload) {
    try {
      const res = await api.post("/api/v1/menu/option", payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionAPI.create");
    }
  },

  /** 옵션 수정 */
  async update(payload) {
    try {
      const res = await api.put("/api/v1/menu/option", payload);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionAPI.update");
    }
  },

  /** 옵션 삭제 */
  async remove(menuOptId) {
    try {
      const res = await api.delete(`/api/v1/menu/option/${menuOptId}`);
      return res.data?.response ?? res.data;
    } catch (err) {
      return handleApiError(err, "menuOptionAPI.remove");
    }
  },
};

export default menuOptionAPI;
