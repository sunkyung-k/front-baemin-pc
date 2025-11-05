import api from "@/api/axiosApi";
import { handleApiError } from "@/utills/handleApiError";

const authAPI = {
  /** 회원가입 요청 */
  async register(payload) {
    try {
      console.log("회원가입 요청 데이터:", payload);
      const res = await api.post("/api/v1/register", payload);
      console.log("회원가입 응답:", res.data);
      return res.data;
    } catch (err) {
      handleApiError(err, "authAPI.register");
      throw err;
    }
  },
};

export default authAPI;
