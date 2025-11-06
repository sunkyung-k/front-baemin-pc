import api from "@/api/axiosApi";

/**
 * 사용자 계정 관련 API
 * -------------------------------------------------
 * - axios 내부에서 throw 로 통일
 * - handleApiError 는 훅(useAccount) 쪽에서 처리
 */
const accountAPI = {
  /** 내 정보 조회 */
  async getUserInfo() {
    const res = await api.get("/api/v1/user");

    return res.data.response?.vo ?? null;
  },

  /** 내 정보 수정 */
  async updateUser(payload) {
    const res = await api.put("/api/v1/user", payload);
    return res.data;
  },

  /** 보유금 충전 */
  async increaseDeposit(payload) {
    const res = await api.post("/api/v1/deposit/increase", payload);
    return res.data;
  },

  /** 회원 탈퇴 */
  async deleteUser() {
    const res = await api.delete("/api/v1/user");
    return res.data;
  },
};

export default accountAPI;
