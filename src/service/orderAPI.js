import api from "@/api/axiosApi";

const orderAPI = {
  /** 유저 주문 내역 조회 */
  async getMyOrders(page = 0) {
    const res = await api.get(`/api/v1/order/my?page=${page}`);
    return res.data;
  },
};

export default orderAPI;
