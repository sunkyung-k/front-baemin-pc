import api from "@/api/axiosApi";

const authAPI = {
  async register(payload) {
    const res = await api.post("/api/v1/register", payload);
    return res.data;
  },
};

export default authAPI;
