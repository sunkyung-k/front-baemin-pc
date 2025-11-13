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
    const status = response?.status;

    // (1) 로그인 요청(/api/v1/login)은 예외 처리 — 세션 만료 alert 금지
    if (requestUrl.includes("/api/v1/login")) {
      return Promise.reject(error);
    }

    // (1-1) 회원탈퇴 실패 예외 처리 (가게 소유 등)
    if (
      config?.method === "delete" &&
      requestUrl.includes("/api/v1/user") &&
      status === 500
    ) {
      // handleApiError 스킵 (로그아웃 방지)
      // 아래 로직(401/403 등)으로 안 내려가게 즉시 리턴
      return Promise.reject(error);
    }

    // (2) 공통 에러 처리
    handleApiError(error, "Axios Response");

    // (3) 접근 권한 없음 (403)
    if (status === 403) {
      alert("접근 권한이 없습니다. 로그인 후 이용해주세요.");
      authStore.getState().clearAuth();
      location.href = "/login";
      return Promise.reject(error);
    }

    // (4) 인증 만료 (401)
    if (status === 401) {
      const token = authStore.getState().token;
      const isLoggedOut = !token; // 이미 로그아웃 상태라면 true

      // 로그아웃 API 요청이거나 이미 로그아웃된 상태면 알림 띄우지 않음
      if (requestUrl.includes("/api/v1/logout") || isLoggedOut) {
        authStore.getState().clearAuth();
        location.href = "/login";
        return Promise.reject(error);
      }

      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      authStore.getState().clearAuth();
      location.href = "/login";
      return Promise.reject(error);
    }

    // (5) 토큰 재발급 (406)
    if (status === 406 && !config._retry) {
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
