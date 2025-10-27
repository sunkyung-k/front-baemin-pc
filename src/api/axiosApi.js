import axios from "axios";
import { authStore } from "../store/authStore";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

//리퀘스트 전에 인증토큰 있으면 헤더에 추가
api.interceptors.request.use((config) => {
  //zustand 를 호출할 때
  //컴포넌트가 아닌 곳에서는 getState() 함수를 통해서 가져와함
  const token = authStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//응답 지연 방지
let isRefreshing = false;

//응답내용을 가로채기
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    console.log(response);
    if (response?.status === 401) {
      console.log("로그인 실패");
      //로그인 실패 시 기존 localstorage  삭제
      authStore.getState().clearAuth();
      return Promise.reject(error);
    }

    if (response?.status === 406 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        config._retry = true; //  무한방지 플래그
      }

      try {
        const res = await axios.get("/api/v1/refresh", { withCredentials: true });
        authStore.getState().setLogin(res.data.response.content);

        const token = authStore.getState().token;
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (error) {
        //refresh 실패
        alert("유효하지 않은 토큰입니다. 다시 로그인하세요");
        authStore.getState().clearAuth();
        location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
