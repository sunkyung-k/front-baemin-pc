import api from "@/api/axiosApi";
import { authStore } from "@/store/authStore";

const storeAPI = {
  /** 가게 등록 */
  async create(formData) {
    const res = await api.post("/api/v1/store", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (import.meta.env.MODE === "development") {
      console.log("[storeAPI] 가게 등록 완료:", res.data);
    }

    return res.data;
  },

  /** 내 가게 조회 */
  async getMyStore() {
    const { userRole } = authStore.getState();

    if (import.meta.env.MODE === "development") {
      console.log("[DEBUG] [storeAPI] getMyStore 호출 (/store/my)");
    }

    // OWNER 계정 아닌 경우
    if (!userRole?.includes("OWNER")) {
      if (import.meta.env.MODE === "development") {
        console.warn("[storeAPI] OWNER 계정이 아닙니다.");
      }
      return null;
    }

    const res = await api.get(`/api/v1/store/my`);
    const data = res.data.response?.vo ?? res.data.response;

    // 유효한 가게만 상태 반영
    if (data?.storeId && data.delYn !== "Y") {
      authStore.getState().setStoreId(data.storeId);

      if (import.meta.env.MODE === "development") {
        console.log("[storeAPI] 내 가게 조회 성공:", data);
      }

      return data;
    }

    // 가게가 없거나 삭제된 경우 초기화
    authStore.getState().clearStoreId();
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

    if (import.meta.env.MODE === "development") {
      console.log(`[storeAPI] 가게 삭제 완료 (storeId=${storeId})`);
    }

    authStore.getState().clearStoreId();
    return res.data;
  },

  /** 유저용 가게 상세 조회 (로그인 불필요) */
  async getStoreDetail(storeId) {
    if (import.meta.env.MODE === "development") {
      console.log(`[storeAPI] getStoreDetail 호출 (storeId=${storeId})`);
    }

    const res = await api.get(`/api/v1/store/${storeId}`);
    return res.data;
  },
};

export default storeAPI;
