import { authStore } from "../store/authStore";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosApi";
import { useNavigate } from "react-router";

export const useLogin = () => {
  const { setLogin } = authStore();
  const queryClient = useQueryClient(); // App.jsx 에서 선언한 queryClient 를 가져온다.
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      try {
        const response = await api.post("/api/v1/login", credentials, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }); // 나머지는 json 방식으로 보내면 되지만 로그인은 폼 방식이기 때문에 이렇게 보내야함

        return response.data;
      } catch (error) {
        throw error.response?.data || error; // response.data 가 있으면 던지고 아니면 그냥 error 던지기
      }
    },
    // mutationFn 이 성공하면 onSuccess 가 실행된다
    onSuccess: (data) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // 토큰 저장
      setLogin(data.content);
      navigate("/");
    },
    // mutationFn 이 실패하면 onError 가 실행된다
    onError: (error) => {
      console.error("Login 실패. ", error);
    },
  });
};
