import api from "@/api/axiosApi";

/** 메뉴 카테고리 관련 API */
const menuCategoryAPI = {
  /** 카테고리 목록 조회 */
  async getList(storeId) {
    const res = await api.get(`/api/v1/store/${storeId}`);
    return res?.data?.response?.vo?.menuCategoryList ?? [];
  },

  /** 카테고리 등록 */
  async create(payload) {
    const clean = {
      storeId: payload.storeId,
      menuCaName: payload.menuCaName,
      displayOrder: Math.max(Number(payload.displayOrder || 1), 1),
    };
    const res = await api.post(`/api/v1/menu/category`, clean);
    return res.data;
  },

  /** 카테고리 수정 */
  async update(payload) {
    const clean = {
      menuCaId: payload.menuCaId,
      storeId: payload.storeId,
      menuCaName: payload.menuCaName,
      displayOrder: Math.max(Number(payload.displayOrder || 1), 1),
    };
    const res = await api.put(`/api/v1/menu/category`, clean);
    return res.data;
  },

  /** 카테고리 삭제 */
  async remove(menuCaId) {
    const res = await api.delete(`/api/v1/menu/category/${menuCaId}`);
    return res?.data ?? { resultCode: "200", response: "OK" };
  },
};

export default menuCategoryAPI;
