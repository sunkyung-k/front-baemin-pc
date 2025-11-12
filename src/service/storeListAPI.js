import api from "@/api/axiosApi";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * - Axios 호출, 주소/에러 처리
 */
const storeListAPI = {
  /** 가게 리스트 조회 (검색/카테고리 필터 포함) */
  async getStores(params = {}) {
    const { address } = useAddressStore.getState();

    // 주소 없으면 호출 막기
    if (!address) {
      console.warn("주소 정보가 없어 가게 목록 요청이 취소되었습니다.");
      alert("현재 위치를 먼저 설정해주세요!");
      return { content: [], pageInfo: null };
    }

    // 구 까지 추출
    const shortAddr = address.split(" ").slice(0, 3).join(" ");

    try {
      const res = await api.get("/api/v1/store", {
        params: { ...params, addr: shortAddr },
      });

      return res.data.response;
    } catch (err) {
      console.error("가게 리스트 호출 실패:", err);
      return { content: [], pageInfo: null };
    }
  },
};

export default storeListAPI;
