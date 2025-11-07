import api from "@/api/axiosApi";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * 🏪 가게 리스트 / 상세 조회 (유저 전용)
 */
const storeListAPI = {
  /** 가게 리스트 조회 (검색/카테고리 필터 포함) */
  async getStores(params = {}) {
    const { address } = useAddressStore.getState();

    // 🧤 주소 없으면 호출 막기
    if (!address) {
      console.warn("⚠️ 주소 정보가 없어 가게 목록 요청이 취소되었습니다.");
      alert("현재 위치를 먼저 설정해주세요!");
      return [];
    }

    // 📍 ‘서울 마포구 서강로 136’ → ‘서울 마포구’까지만 추출
    const shortAddr = address.split(" ").slice(0, 3).join(" ");

    try {
      const res = await api.get("/api/v1/store", {
        params: { ...params, addr: shortAddr },
      });

      const data = res.data?.response?.content ?? [];

      if (import.meta.env.MODE === "development") {
        console.log("[storeListAPI] getStores 응답:", data);
      }

      return data;
    } catch (err) {
      console.error("🚨 가게 리스트 호출 실패:", err);
      return [];
    }
  },

  /** 단일 가게 상세 조회 */
  async getStoreDetail(storeId) {
    const res = await api.get(`/api/v1/store/${storeId}`);
    const data = res.data?.response?.vo ?? res.data?.response ?? null;

    if (import.meta.env.MODE === "development") {
      console.log(`[storeListAPI] getStoreDetail(${storeId}) 응답:`, data);
    }

    return data;
  },
};

export default storeListAPI;
