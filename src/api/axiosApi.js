import axios from "axios";
import { authStore } from "../store/authStore";
import { handleApiError } from "../utills/handleApiError";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (토큰 자동 주입)
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    handleApiError(error, "Axios Request"); // 요청 단계 에러 처리
    return Promise.reject(error);
  }
);

// 응답 지연 방지 플래그
let isRefreshing = false;

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response, // 정상 응답 시 그대로 반환
  async (error) => {
    const { response, config } = error;

    // 공통 에러 로그 출력
    handleApiError(error, "Axios Response");

    // 403 (권한 없음)
    if (response?.status === 403) {
      alert("접근 권한이 없습니다. 로그인 후 이용해주세요.");
      authStore.getState().clearAuth();
      location.href = "/login";
      return Promise.reject(error);
    }

    // 401 (인증 실패)
    if (response?.status === 401) {
      authStore.getState().clearAuth();
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      location.href = "/login";
      return Promise.reject(error);
    }

    // 406 (토큰 불일치 / 재발급 필요)
    if (response?.status === 406 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        config._retry = true;
      }

      try {
        // 순수 axios로 refresh 요청 (무한루프 방지)
        const res = await axios.get("/api/v1/refresh", {
          withCredentials: true,
        });

        // 토큰 갱신 및 재요청
        authStore.getState().setLogin(res.data.response.content);
        const token = authStore.getState().token;
        config.headers.Authorization = `Bearer ${token}`;

        return api(config);
      } catch (refreshError) {
        handleApiError(refreshError, "Axios Token Refresh");
        alert("유효하지 않은 토큰입니다. 다시 로그인 해주세요.");
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
