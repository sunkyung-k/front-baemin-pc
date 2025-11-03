import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

export const categoryAPI = {
  /** 카테고리 목록 조회 (공통) */
  async getCategories() {
    try {
      const res = await api.get("/api/v1/store/category");
      return res.data.response || [];
    } catch (err) {
      handleApiError(err, "categoryAPI.getCategories");
      return [];
    }
  },
};
