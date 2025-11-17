import api from "@/api/axiosApi";
import { authStore } from "@/store/authStore";

const storeAPI = {
  /** 가게 등록 (점주) */
  async create(formData) {
    const res = await api.post("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (import.meta.env.MODE === "development") {
      console.log("[storeAPI] 가게 등록 완료:", res.data);
    }

    return res.data;
  },

  /** 점주 전용 - 내 가게 조회 */
  async getMyStore() {
    const { userRole } = authStore.getState();

    if (!userRole?.includes("OWNER")) {
      return null;
    }

    const res = await api.get(`/api/v1/store/my`);
    const data = res.data.response?.vo ?? res.data.response;

    if (data?.storeId && data.delYn !== "Y") {
      return data; // storeId는 여기서 반환
    }

    return null;
  },

  /** 가게 수정 */
  async update(formData) {
    const res = await api.put("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (import.meta.env.MODE === "development") {
      console.log("[storeAPI] 가게 수정 성공:", res.data);
    }

    return res.data;
  },

  /** 가게 삭제 */
  async remove(storeId) {
    const res = await api.delete(`/api/v1/store/${storeId}`);
    return res.data;
  },

  /** 가게 상세 조회 (vo + ownerInfo + closeYn 병합) */
  async getStoreDetail(storeId) {
    if (import.meta.env.MODE === "development") {
      console.log(`[storeAPI] getStoreDetail 호출 (storeId=${storeId})`);
    }

    const res = await api.get(`/api/v1/store/${storeId}`);

    // 백엔드 응답
    const vo = res.data?.response?.vo ?? null;
    const ownerInfo = res.data?.response?.ownerInfo ?? null;

    // 휴무 여부 (백엔드 값 우선)
    const closeYn = vo?.closeYn ?? "N";

    // 상세 데이터 구성
    const merged = { ...vo, ownerInfo, closeYn };

    if (import.meta.env.MODE === "development") {
      console.log("[storeAPI] getStoreDetail merged:", merged);
    }

    return merged;
  },
};

export default storeAPI;
