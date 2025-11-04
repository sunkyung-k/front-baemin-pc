import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 카테고리 관련 API */
const menuCategoryAPI = {
  /** 카테고리 목록 조회 */
  async getList(storeId) {
    try {
      const res = await api.get(`/api/v1/store/${storeId}`);
      // 백엔드에서 이미 정렬 및 필터링된 리스트 제공
      return res?.data?.response?.vo?.menuCategoryList ?? [];
    } catch (err) {
      const msg = handleApiError(err, "menuCategoryAPI.getList");
      throw new Error(msg);
    }
  },

  /** 카테고리 등록 */
  async create(payload) {
    try {
      const clean = {
        storeId: payload.storeId,
        menuCaName: payload.menuCaName,
        displayOrder: Math.max(Number(payload.displayOrder || 1), 1),
      };
      const res = await api.post(`/api/v1/menu/category`, clean);
      return res.data;
    } catch (err) {
      const msg = handleApiError(err, "menuCategoryAPI.create");
      throw new Error(msg);
    }
  },

  /** 카테고리 수정 */
  async update(payload) {
    try {
      const clean = {
        menuCaId: payload.menuCaId,
        storeId: payload.storeId,
        menuCaName: payload.menuCaName,
        displayOrder: Math.max(Number(payload.displayOrder || 1), 1),
      };
      const res = await api.put(`/api/v1/menu/category`, clean);
      return res.data;
    } catch (err) {
      const msg = handleApiError(err, "menuCategoryAPI.update");
      throw new Error(msg);
    }
  },

  /** 카테고리 삭제 */
  async remove(menuCaId) {
    try {
      const res = await api.delete(`/api/v1/menu/category/${menuCaId}`);
      return res?.data ?? { resultCode: "200", response: "OK" };
    } catch (err) {
      const msg = handleApiError(err, "menuCategoryAPI.remove");
      throw new Error(msg);
    }
  },
};

export default menuCategoryAPI;
