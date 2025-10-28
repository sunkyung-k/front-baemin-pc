import axios from "axios";
import { authStore } from "../store/authStore";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 리퀘스트 전에 인증 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
  (config) => {
    // zustand 를 호출할 때 컴포넌트가 아닌 곳에서는 getState() 함수를 사용해서 가져와야함.
    const token = authStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error); // 호출한 곳에 에러를 던진다. 즉, 인터셉터에서 에러를 처리하는 것이 아니라 호출한 곳에서 에러를 처리하도록 함.
  }
);

// 응답 지연 방지
let isRefreshing = false;

// 응답 내용을 가로채기
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // 로그인을 하지 않은 경우
    if (response?.status === 403) {
      alert("권한 없음!");
      // 기존 localStorage 데이터 삭제
      authStore.getState().clearAuth();
      location.href = "/login";
    }

    // 로그인 실패한 경우
    if (response?.status === 401) {
      // 기존 localStorage 데이터 삭제
      authStore.getState().clearAuth();

      return Promise.reject(error);
    }

    // 토큰이 잘못된 경우,
    if (response?.status === 406 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        config._retry = true; // 무한루프 방지 플래그
      }

      try {
        // api 인터셉터 안에서 또 api 를 그대로 사용하면 무한루프에 빠질 수 있으므로 순수한 axios 를 사용함
        // 쿠키에 저장된 refresh 토큰을 사용해 재 로그인 시도
        const res = await axios.get("/api/v1/refresh", {
          withCredentials: true,
        }); // withCredentials 을 true 로 주면 쿠키가 포함된다.

        authStore.getState().setLogin(res.data.response.content);
        const token = authStore.getState().token;
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (error) {
        // refresh 실패한 경우
        alert("유효하지 않은 토큰입니다. 다시 로그인 하세요.");
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
