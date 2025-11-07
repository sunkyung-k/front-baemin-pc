import { useQuery, useMutation } from "@tanstack/react-query";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import accountAPI from "@/service/accountAPI";

/**
 * useAccount 훅
 * -------------------------------------------------
 * - 내 정보 수정 / 보유금 충전 / 계정 탈퇴 통합 관리
 * - 공통 에러 핸들링, React Query 캐시 통일
 */
export function useAccount() {
  const { userId } = authStore.getState();
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL);

  /** 내 정보 조회 */
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
    isError: isUserInfoError,
  } = useQuery({
    queryKey: QUERY_KEYS.USER_INFO(userId), // 객체 형태로 쿼리 키 전달
    queryFn: accountAPI.getUserInfo,
    enabled: !!userId,
    onError: (err) => handleApiError(err, "useAccount.getUserInfo"),
  });

  /** 내 정보 수정 */
  const update = useMutation({
    mutationFn: accountAPI.updateUser,
    onSettled: () => afterMutation(QUERY_KEYS.USER_INFO(userId)),
    onError: (err) => handleApiError(err, "useAccount.update"),
  });

  /** 보유금 충전 */
  const deposit = useMutation({
    mutationFn: accountAPI.increaseDeposit,
    onSettled: () => afterMutation(QUERY_KEYS.USER_INFO(userId)),
    onError: (err) => handleApiError(err, "useAccount.deposit"),
  });

  /** 회원 탈퇴 */
  const remove = useMutation({
    mutationFn: accountAPI.deleteUser,
    onSuccess: () => {
      authStore.getState().clearAuth();
    },
    onError: (err) => handleApiError(err, "useAccount.remove"),
  });

  return {
    userInfo,
    isUserInfoLoading,
    isUserInfoError,
    update,
    deposit,
    remove,
  };
}

export default useAccount;
