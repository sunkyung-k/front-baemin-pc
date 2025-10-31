import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 카테고리 관련 API */
const menuCategoryAPI = {
  /** 카테고리 목록 조회 */
  async getList(storeId) {
    try {
      const res = await api.get(`/api/v1/store/${storeId}`);
      const list = res?.data?.response?.vo?.menuCategoryList ?? [];
      return Array.isArray(list)
        ? list
            .filter((v) => v.delYn === "N")
            .sort((a, b) => a.displayOrder - b.displayOrder)
        : [];
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.getList");
      return [];
    }
  },

  /** 카테고리 등록 */
  async create(payload) {
    try {
      const res = await api.post(`/api/v1/menu/category`, payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.create");
      throw err;
    }
  },

  /** 카테고리 수정 */
  async update(payload) {
    try {
      const res = await api.put(`/api/v1/menu/category`, payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.update");
      throw err;
    }
  },

  /** 카테고리 삭제 (Soft Delete) */
  async remove(menuCaId) {
    try {
      const res = await api.delete(`/api/v1/menu/category/${menuCaId}`);
      return res?.data ?? { resultCode: "200", response: "OK" };
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.remove");
      throw err;
    }
  },
};

export default menuCategoryAPI;
