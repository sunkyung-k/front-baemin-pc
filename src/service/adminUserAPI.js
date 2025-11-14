import api from "@/api/axiosApi";

/**
 * adminUserAPI (최종 버전)
 * 백엔드 스펙 100% 반영
 */
const adminUserAPI = {
  /** 🔥 회원 리스트 조회 */
  async getList({ searchText, page = 0, delYn = "N" }) {
    const { data } = await api.get("/api/v1/admin/user", {
      params: { searchText, page, delYn },
    });

    if (data.resultCode !== "200") throw new Error("회원 목록 조회 실패");

    return data.response; // { pageInfo, content }
  },

  /** 🔥 회원 상세 조회 */
  async getDetail(userId) {
    const { data } = await api.get(`/api/v1/admin/user/${userId}`);

    if (data.resultCode !== "200") throw new Error("회원 상세 조회 실패");

    return data.response.vo;
  },

  /** 🔥 회원 등록 */
  async create(form) {
    const { data } = await api.post("/api/v1/admin/user", form);

    if (data.resultCode !== "200") throw new Error("회원 등록 실패");

    return data.response; // “OK"
  },

  /** 🔥 회원 수정 */
  async update(form) {
    const { data } = await api.put("/api/v1/admin/user", form);

    if (data.resultCode !== "200") throw new Error("회원 수정 실패");

    return data.response; // "OK"
  },

  /** 🔥 회원 삭제 */
  async remove(userId) {
    const { data } = await api.delete(`/api/v1/admin/user/${userId}`);

    if (data.resultCode !== "200") throw new Error("회원 삭제 실패");

    return data.response; // "OK"
  },
};

export default adminUserAPI;
