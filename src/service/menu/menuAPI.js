import api from "@/api/axiosApi";

/** 메뉴 관련 API */
const menuAPI = {
  /** 메뉴 등록 */
  async create(formData) {
    const res = await api.post(`/api/v1/menu`, formData);
    return res.data?.response;
  },

  /** 메뉴 수정 */
  async update(formData) {
    const res = await api.put(`/api/v1/menu`, formData);
    return res.data?.response;
  },

  /** 메뉴 삭제 (Soft Delete) */
  async remove(menuId) {
    const res = await api.delete(`/api/v1/menu/${menuId}`);
    return res.data?.response;
  },

  /** 카테고리별 메뉴 목록 조회 */
  async getCategoryWithMenus(menuCaId) {
    const res = await api.get(`/api/v1/menu/category/${menuCaId}`);
    return res?.data?.response?.vo ?? {};
  },

  /** 단일 메뉴 상세 조회 (옵션 그룹 포함) */
  async getMenuDetail(menuId) {
    const res = await api.get(`/api/v1/menu/${menuId}`);
    return res?.data?.response?.vo ?? null;
  },

  /** 메뉴 복사 */
  async copy(menuId) {
    const res = await api.post(`/api/v1/menu/copy/${menuId}`);
    return res.data?.response;
  },
};

export default menuAPI;
