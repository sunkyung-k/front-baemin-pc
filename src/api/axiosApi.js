// src/api/axiosApi.js
import axios from "axios";
import { authStore } from "@/store/authStore";
import { handleApiError } from "@/utills/handleApiError";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:9090",
  withCredentials: true, // 쿠키 기반 refresh 지원
});

// 요청 인터셉터 : JWT 자동 주입
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    handleApiError(error, "Axios Request");
    return Promise.reject(error);
  }
);

// refresh 중복 방지 flag
let isRefreshing = false;

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const requestUrl = config?.url || "";

    // (1) 로그인 요청(/api/v1/login)은 예외 처리 — 세션 만료 alert 금지
    if (requestUrl.includes("/api/v1/login")) {
      // 로그인 페이지에서 직접 에러 메시지를 표시해야 하므로 여기서는 아무 alert도 띄우지 않음
      return Promise.reject(error);
    }

    // 공통 에러 처리
    handleApiError(error, "Axios Response");

    // (2) 접근 권한 없음 (403)
    if (response?.status === 403) {
      alert("접근 권한이 없습니다. 로그인 후 이용해주세요.");
      authStore.getState().clearAuth();
      location.href = "/login";
      return Promise.reject(error);
    }

    // (3) 인증 만료 (401)
    if (response?.status === 401) {
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      authStore.getState().clearAuth();
      location.href = "/login";
      return Promise.reject(error);
    }

    // (4) 토큰 재발급 (406)
    if (response?.status === 406 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        config._retry = true;
      }

      try {
        const res = await axios.get("/api/v1/refresh", {
          withCredentials: true,
        });

        // 토큰 저장
        authStore.getState().setLogin(res.data.response.content);

        // 기존 요청 복원
        const token = authStore.getState().token;
        config.headers.Authorization = `Bearer ${token}`;
        config.method = config.method || "get";

        return api(config); // 재요청
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
