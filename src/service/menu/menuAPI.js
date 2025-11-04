import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 관련 API */
const menuAPI = {
  /** 메뉴 등록 */
  async create(formData) {
    try {
      const res = await api.post(`/api/v1/menu`, formData);
      return res.data?.response;
    } catch (err) {
      handleApiError(err, "menuAPI.create");
      throw err;
    }
  },

  /** 메뉴 수정 */
  async update(formData) {
    try {
      const res = await api.put(`/api/v1/menu`, formData);
      return res.data?.response;
    } catch (err) {
      handleApiError(err, "menuAPI.update");
      throw err;
    }
  },

  /** 메뉴 삭제 (Soft Delete) */
  async remove(menuId) {
    try {
      const res = await api.delete(`/api/v1/menu/${menuId}`);
      return res.data?.response;
    } catch (err) {
      handleApiError(err, "menuAPI.remove");
      throw err;
    }
  },

  /** 카테고리별 메뉴 목록 조회 */
  async getCategoryWithMenus(menuCaId) {
    try {
      const res = await api.get(`/api/v1/menu/category/${menuCaId}`);
      return res?.data?.response?.vo ?? {};
    } catch (err) {
      handleApiError(err, "menuAPI.getCategoryWithMenus");
      throw err;
    }
  },

  /** 단일 메뉴 상세 조회 (옵션 그룹 포함) */
  async getMenuDetail(menuId) {
    try {
      const res = await api.get(`/api/v1/menu/${menuId}`);
      return res?.data?.response?.vo ?? null;
    } catch (err) {
      handleApiError(err, "menuAPI.getMenuDetail");
      throw err;
    }
  },
};

export default menuAPI;
