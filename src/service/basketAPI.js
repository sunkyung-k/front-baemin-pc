import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/**
 * 장바구니 관련 API
 * --------------------------------------------------
 * - 오직 서버 통신만 담당 (UI 처리 없음)
 * - 모든 UI 반응(알럿, 토스트 등)은 useBasket 훅에서 관리
 */
const basketAPI = {
  /** 나의 장바구니 가져오기 */
  async getMyBasket() {
    try {
      const res = await api.get(`/api/v1/basket`);
      // 백엔드에서 basketId, totalPrice, itemList 구조 반환
      return res?.data?.response?.vo ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.getMyBasket");
      return null;
    }
  },

  /** 장바구니에 메뉴 추가 */
  async addMenu(payload) {
    /**
     * payload 예시:
     * {
     *   userId: "user123",
     *   menu: {
     *     menuId: 10,
     *     quantity: 2,
     *     optionList: [
     *       { menuOptId: 13, quantity: 2 }
     *     ]
     *   },
     *   storeId: 8
     * }
     */
    try {
      const res = await api.post(`/api/v1/basket`, payload);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.addMenu");
      throw err;
    }
  },

  /** 개별 메뉴 삭제 */
  async removeItem(basketItemId) {
    try {
      const res = await api.delete(`/api/v1/basket/item/${basketItemId}`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.removeItem");
      throw err;
    }
  },

  /** 메뉴 수량 증가 */
  async increaseItem(basketItemId) {
    try {
      const res = await api.put(`/api/v1/basket/item/${basketItemId}/increase`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.increaseItem");
      throw err;
    }
  },

  /** 메뉴 수량 감소 */
  async decreaseItem(basketItemId) {
    try {
      const res = await api.put(`/api/v1/basket/item/${basketItemId}/decrease`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.decreaseItem");
      throw err;
    }
  },

  /** 장바구니 전체 비우기 */
  async clearAll() {
    try {
      const res = await api.delete(`/api/v1/basket`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.clearAll");
      throw err;
    }
  },

  /** 장바구니 전체 주문 */
  async orderAll(payload) {
    /**
     * payload 예시:
     * {
     *   addr: "서울특별시 은평구",
     *   addrDetail: "은평경찰서 2층"
     * }
     */
    try {
      const res = await api.post(`/api/v1/basket/order`, payload);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.orderAll");
      throw err;
    }
  },
};

export default basketAPI;
