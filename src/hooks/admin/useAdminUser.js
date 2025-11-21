import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminUserAPI from "@/service/admin/adminUserAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { handleApiError } from "@/utills/handleApiError";
import { authStore } from "@/store/authStore";

/** 어드민: 회원 리스트 조회 */
export function useAdminUserList(params) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USER_LIST(params),
    queryFn: () => adminUserAPI.getList(params),
    onError: (err) => handleApiError(err, "useAdminUserList"),
  });
}

/** 어드민: 회원 상세 조회 */
export function useAdminUserDetail(userId, enabled = false) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USER_DETAIL(userId),
    queryFn: () => adminUserAPI.getDetail(userId),
    enabled: !!userId && enabled,
    onError: (err) => handleApiError(err, "useAdminUserDetail"),
  });
}

/** 어드민: 회원 등록 / 수정 / 삭제 */
export function useAdminUserMutation() {
  const queryClient = useQueryClient();
  const afterList = useAfterMutation(AFTER_TYPES.LIST);

  /** 회원 등록 */
  const create = useMutation({
    mutationFn: adminUserAPI.create,
    onSuccess: () => {
      afterList(["adminUserList"]);
    },
    onError: (err) => handleApiError(err, "adminUser.create"),
  });

  /** 회원 수정 */
  const update = useMutation({
    mutationFn: adminUserAPI.update,
    onSuccess: (_, variables) => {
      afterList(["adminUserList"]);
      queryClient.invalidateQueries(
        QUERY_KEYS.ADMIN_USER_DETAIL(variables.userId)
      );
      queryClient.invalidateQueries(QUERY_KEYS.MY_INFO);
    },
    onError: (err) => handleApiError(err, "adminUser.update"),
  });

  /** 회원 삭제 */
  const remove = useMutation({
    mutationFn: adminUserAPI.remove,
    onSuccess: (_, __, userId) => {
      afterList(["adminUserList"]);
    },
    onError: (err) => handleApiError(err, "adminUser.remove"),
  });

  return { create, update, remove };
}
