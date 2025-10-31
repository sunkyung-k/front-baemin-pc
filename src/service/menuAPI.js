import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 관련 API */
const menuAPI = {
  /** 메뉴 등록 */
  async create(formData) {
    try {
      const res = await api.post(`/api/v1/menu`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      handleApiError(err, "menuAPI.create");
      throw err;
    }
  },

  /** 메뉴 수정 */
  async update(formData) {
    try {
      const res = await api.put(`/api/v1/menu`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      handleApiError(err, "menuAPI.update");
      throw err;
    }
  },

  /** 메뉴 삭제 */
  async remove(menuId) {
    try {
      const res = await api.delete(`/api/v1/menu/${menuId}`);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuAPI.remove");
      throw err;
    }
  },

  /** 특정 카테고리 내 메뉴 조회 */
  async getCategoryWithMenus(menuCaId) {
    try {
      const res = await api.get(`/api/v1/menu/category/${menuCaId}`);
      return res?.data?.response?.vo ?? {};
    } catch (err) {
      handleApiError(err, "menuAPI.getCategoryWithMenus");
      return {};
    }
  },
};

export default menuAPI;
