// src/service/menuOptionAPI.js
import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/**
 * 메뉴 옵션 관련 API
 * - 옵션 등록 / 수정 / 삭제
 */
const menuOptionAPI = {
  /** 옵션 등록 */
  async create(payload) {
    try {
      const res = await api.post("/api/v1/menu/option", payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuOptionAPI.create");
      throw err;
    }
  },

  /** 옵션 수정 */
  async update(payload) {
    try {
      const res = await api.put("/api/v1/menu/option", payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuOptionAPI.update");
      throw err;
    }
  },

  /** 옵션 삭제 */
  async remove(menuOptId) {
    try {
      const res = await api.delete(`/api/v1/menu/option/${menuOptId}`);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuOptionAPI.remove");
      throw err;
    }
  },
};

export default menuOptionAPI;
