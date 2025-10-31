import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/** 메뉴 관련 API */
const menuAPI = {
  async create(formData) {
    const res = await api.post(`/api/v1/menu`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async update(formData) {
    const res = await api.put(`/api/v1/menu`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async remove(menuId) {
    const res = await api.delete(`/api/v1/menu/${menuId}`);
    return res.data;
  },

  async getCategoryWithMenus(menuCaId) {
    const res = await api.get(`/api/v1/menu/category/${menuCaId}`);
    return res?.data?.response?.vo ?? {};
  },
};

export default menuAPI;
