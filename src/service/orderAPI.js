import api from "@/api/axiosApi";

const orderAPI = {
  /** [USER] 유저 주문 내역 조회 */
  async getMyOrders(page = 0) {
    const res = await api.get(`/api/v1/order/my`, {
      params: { page },
    });
    // 백엔드 구조: res.data.response.pageInfo + res.data.response.content
    return res.data.response;
  },

  /** [OWNER] 점주용 주문 리스트 조회 (페이지 포함) */
  async getMyStoreOrders(page = 0) {
    const res = await api.get(`/api/v1/order/store/my`, {
      params: { page },
    });
    return res.data.response;
  },

  /** [OWNER] 주문 상태 변경 */
  async updateStatus(orderId, newStatus) {
    const payload = { orderId, newStatus };
    const res = await api.put(`/api/v1/order/status`, payload);
    return res.data;
  },

  /** [OWNER] 가게 매출 통계 조회 */
  async getStoreSales(storeId) {
    const res = await api.get(`/api/v1/order/store/${storeId}/sales`);
    return res.data.response;
  },
};

export default orderAPI;
