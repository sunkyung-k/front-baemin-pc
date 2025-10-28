import { authStore } from "../store/authStore";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosApi";
import { useNavigate } from "react-router";

export const useLogout = () => {
  const { clearAuth } = authStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        // 백엔드 로그아웃 요청
        const response = await api.post("/api/v1/logout");
        return response.data;
      } catch (error) {
        // 서버에서 로그아웃 실패 시에도 에러 던지기
        throw error.response?.data || error;
      }
    },
    onSuccess: (data) => {
      console.log("Logout 성공:", data);

      // 캐시 초기화
      queryClient.clear();

      // 로컬 상태 및 로컬스토리지 초기화
      clearAuth();

      // 로그아웃 후 이동할 페이지 (예: 로그인 화면)
      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout 실패:", error);

      // 에러가 나더라도 클라이언트 상태는 정리
      clearAuth();
      navigate("/login");
    },
  });
};
