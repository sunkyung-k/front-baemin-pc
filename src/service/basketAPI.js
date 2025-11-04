import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

/**
 * basketAPI
 * ------------------------------------------------------
 * - 장바구니 관련 서버 통신 전용 모듈
 * - 모든 비즈니스 로직은 useBasket 훅에서 처리
 */
const basketAPI = {
  /** 나의 장바구니 조회 */
  async getMyBasket() {
    try {
      const res = await api.get("/api/v1/basket");
      return res?.data?.response?.vo ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.getMyBasket");
      return null;
    }
  },

  /** 메뉴 추가 */
  async addMenu(payload) {
    try {
      const res = await api.post("/api/v1/basket", payload);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.addMenu");
      throw err;
    }
  },

  /** 항목 삭제 */
  async removeItem(basketItemId) {
    try {
      const res = await api.delete(`/api/v1/basket/item/${basketItemId}`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.removeItem");
      throw err;
    }
  },

  /** 수량 증가 */
  async increaseItem(basketItemId) {
    try {
      const res = await api.put(`/api/v1/basket/item/${basketItemId}/increase`);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.increaseItem");
      throw err;
    }
  },

  /** 수량 감소 */
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
      const res = await api.delete("/api/v1/basket");
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.clearAll");
      throw err;
    }
  },

  /** 장바구니 전체 주문 */
  async orderAll(payload) {
    try {
      const res = await api.post("/api/v1/basket/order", payload);
      return res?.data?.response ?? null;
    } catch (err) {
      handleApiError(err, "basketAPI.orderAll");
      throw err;
    }
  },
};

export default basketAPI;
