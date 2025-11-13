import { authStore } from "../store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosApi";
import { useNavigate } from "react-router-dom";
import { useHandleError } from "@/hooks/common/useHandleError";

export const useLogin = () => {
  const { setLogin } = authStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleError = useHandleError();

  return useMutation({
    /** 로그인 요청 */
    mutationFn: async (credentials) => {
      try {
        const response = await api.post("/api/v1/login", credentials, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
      } catch (error) {
        // 백엔드 응답 포맷 통일
        throw error.response?.data || error;
      }
    },

    /** 로그인 성공 시 */
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      authStore.getState().setLogin(data.content);
      navigate("/", { replace: true });
    },

    /** 로그인 실패 시 */
    onError: (err) => {
      handleError(err, "auth.login");
    },
  });
};
