import api from "@/api/axiosApi";

/**
 * adminMenuAPI (remove 버전)
 * --------------------------------------------------
 * - 관리자 메뉴 삭제 (removeMenu)
 * - 관리자 메뉴 옵션 삭제 (removeMenuOption)
 */
const adminMenuAPI = {
  /** 메뉴 삭제 */
  async removeMenu(menuId) {
    const res = await api.delete(`/api/v1/admin/menu/${menuId}`);
    return res.data?.response ?? res.data;
  },

  /** 메뉴 옵션 삭제 */
  async removeMenuOption(menuOptId) {
    const res = await api.delete(`/api/v1/admin/menu/option/${menuOptId}`);
    return res.data?.response ?? res.data;
  },
};

export default adminMenuAPI;
