import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import api from "./../api/axiosApi";

export const authStore = create(
  persist(
    immer((set, get) => ({
      token: null,
      userId: null,
      userName: null,
      userRole: null,

      // 로그인 여부 판단 함수
      // token 이 있으면 true 이고 없으면 false 이다.
      isAuthenticated: () => !!get().token, // 훅 상태나 컴포넌트 상태가 아닌데 내부 요소를 부르려면 get() 을 사용함

      // 권한 가져오는 함수
      getUserRole: () => get().userRole,

      // 로그인 후 정보를 저장하는 함수
      setLogin: ({ token, userId, userName, userRole }) =>
        set((state) => {
          state.token = token;
          state.userId = userId;
          state.userName = userName;
          state.userRole = userRole;
        }),

      // 토큰만 갱신하는 함수 (refresh token 을 이용할 때)
      setToken: (token) =>
        set((state) => {
          state.token = token;
        }),

      // 토큰 가져오는 함수
      getToken: () => get().token,

      // 로그아웃 했을 때 정보 지우는 함수
      clearAuth: () => {
        set((state) => {
          state.token = null;
          state.userId = null;
          state.userName = null;
          state.userRole = null;
        });

        // axios authorization 헤더 제거
        delete api.defaults.headers.common["Authorization"];

        // localStorage 데이터 삭제
        authStore.persist.clearStorage();

        // 남아있을수 있는 토큰 수동 삭제
        localStorage.removeItem("auth-info");
      },
    })),

    // 원하는 내용을 localStorage 에 저장
    // zustand 도 새로고침 할 때 기억해둬야 할 내용을 localStorage 에 저장했다가 나중에 꺼내서 준다
    {
      name: "auth-info",
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        userName: state.userName,
        userRole: state.userRole,
      }),
    }
  )
);
