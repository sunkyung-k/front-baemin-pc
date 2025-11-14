import { authStore } from "../store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosApi";
import { useNavigate } from "react-router-dom";
import { useHandleError } from "@/hooks/common/useHandleError";

export const useLogin = () => {
  const { setLogin, setStoreId } = authStore();
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
        throw error.response?.data || error;
      }
    },

    /** 로그인 성공 */
    onSuccess: async (data) => {
      // 1) 로그인 기본 정보 저장
      const content = data.content;
      setLogin(content);

      // 2) 점주라면 → 자동으로 내 가게 조회
      if (content.userRole === "ROLE_OWNER") {
        try {
          const res = await api.get("/api/v1/store/my");
          const storeId = res.data.response.vo?.storeId;

          if (storeId && storeId > 0) {
            setStoreId(storeId); // 가게 존재
          } else {
            setStoreId(null); // 가게 없음
          }
        } catch (err) {
          console.error("내 가게 조회 실패:", err);
          setStoreId(null);
        }
      }

      // 3) 홈으로 이동
      navigate("/", { replace: true });

      // 4) 필요하면 캐시 초기화
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    /** 로그인 실패 */
    onError: (err) => {
      handleError(err, "auth.login");
    },
  });
};
