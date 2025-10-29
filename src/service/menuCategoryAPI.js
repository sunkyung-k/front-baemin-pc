import api from "../api/axiosApi";
import { handleApiError } from "../utills/handleApiError";

const menuCategoryAPI = {
  /** ✅ 카테고리 목록 (storeId별) */
  async getList(storeId) {
    try {
      const res = await api.get(`/api/v1/store/${storeId}`);
      const list = res?.data?.response?.vo?.menuCategoryList ?? [];

      // ✅ delYn이 "N"인 항목만 표시 + displayOrder 오름차순 정렬
      return Array.isArray(list)
        ? list
            .filter((item) => item.delYn === "N")
            .sort((a, b) => a.displayOrder - b.displayOrder)
        : [];
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.getList"); // ✅ 공통 에러 핸들러
      return [];
    }
  },

  /** ✅ 카테고리 등록 */
  async create(payload) {
    try {
      const res = await api.post(`/api/v1/menu/category`, payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.create");
      throw err; // 상위 (React Query)로 에러 전달
    }
  },

  /** ✅ 카테고리 수정 */
  async update(payload) {
    try {
      const res = await api.put(`/api/v1/menu/category`, payload);
      return res.data;
    } catch (err) {
      handleApiError(err, "menuCategoryAPI.update");
      throw err;
    }
  },

  /** ✅ 카테고리 삭제 */
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
