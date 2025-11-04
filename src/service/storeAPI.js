import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/**
 * OWNER 전용 가게 등록 / 조회 / 수정 / 삭제
 * - Axios + Zustand(authStore) 통합 구조
 * - React Query 훅(useStore)에서 직접 사용
 */

const storeAPI = {
  async create(formData) {
    try {
      const res = await api.post("/api/v1/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[storeAPI] 가게 등록 완료:", res.data);
      return res.data;
    } catch (err) {
      handleApiError(err, "storeAPI.create");
      throw err;
    }
  },

  async getMyStore() {
    const { userRole } = authStore.getState();
    console.log(`[DEBUG] [storeAPI] getMyStore 호출 (/store/my)`);

    if (!userRole?.includes("OWNER")) {
      console.warn("[storeAPI] OWNER 계정이 아닙니다.");
      return null;
    }

    try {
      const res = await api.get(`/api/v1/store/my`);
      const data = res.data.response?.vo ?? res.data.response;

      // storeId === 0 이면 ‘가게 없음’ 처리
      if (!data || data.storeId === 0) {
        console.warn("[storeAPI.getMyStore] 등록된 가게 없음 (storeId=0)");
        authStore.getState().clearStoreId();
        return null;
      }

      if (data.delYn === "Y") {
        console.warn("[storeAPI] 삭제된 가게입니다 → storeId 초기화");
        authStore.getState().clearStoreId();
        return null;
      }

      authStore.getState().setStoreId(data.storeId);
      console.log("[storeAPI] 내 가게 조회 성공:", data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;

      if (msg?.includes("등록된 가게가 없습니다")) {
        console.warn("[storeAPI.getMyStore] 등록된 가게 없음 (정상)");
        return null;
      }

      console.error("[storeAPI.getMyStore] 실제 오류 발생:", msg);
      return null;
    }
  },

  async update(formData) {
    try {
      const res = await api.put("/api/v1/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[storeAPI] 가게 수정 성공:", res.data);
      return res.data;
    } catch (err) {
      handleApiError(err, "storeAPI.update");
      throw err;
    }
  },

  async remove(storeId) {
    try {
      const res = await api.delete(`/api/v1/store/${storeId}`);
      console.log(`[storeAPI] 가게 삭제 완료 (storeId=${storeId})`);
      authStore.getState().clearStoreId();
      return res.data;
    } catch (err) {
      handleApiError(err, "storeAPI.remove");
      throw err;
    }
  },

  /** 유저용 가게 상세 조회 (로그인 불필요) */
  async getStoreDetail(storeId) {
    try {
      console.log(`[storeAPI] getStoreDetail 호출 (storeId=${storeId})`);
      const res = await api.get(`/api/v1/store/${storeId}`);
      return res.data;
    } catch (err) {
      handleApiError(err, "storeAPI.getStoreDetail");
      throw err;
    }
  },
};

export default storeAPI;
