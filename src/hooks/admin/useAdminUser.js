// src/hooks/admin/useAdminUser.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminUserAPI from "@/service/admin/adminUserAPI";
import { handleApiError } from "@/utills/handleApiError";

const LIST_KEY = ["adminUserList"];
const DETAIL_KEY = (userId) => ["adminUserDetail", userId];

/** 🔍 유저 리스트 조회 훅 */
export function useAdminUserList(params) {
  return useQuery({
    queryKey: ["adminUserList", params],
    queryFn: () => adminUserAPI.getList(params),
    onError: (err) => handleApiError(err, "useAdminUserList"),
  });
}

/** 🔍 유저 상세 조회 훅 */
export function useAdminUserDetail(userId, enabled = false) {
  return useQuery({
    queryKey: DETAIL_KEY(userId),
    queryFn: () => adminUserAPI.getDetail(userId),
    enabled: !!userId && enabled,
    onError: (err) => handleApiError(err, "useAdminUserDetail"),
  });
}

/** ➕✏❌ 등록/수정/삭제 훅 */
export function useAdminUserMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: adminUserAPI.create,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
    onError: (err) => handleApiError(err, "adminUser.create"),
  });

  const update = useMutation({
    mutationFn: adminUserAPI.update,
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });

      const userId = variables?.userId;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: DETAIL_KEY(userId) });
      }
    },
    onError: (err) => handleApiError(err, "adminUser.update"),
  });

  const remove = useMutation({
    mutationFn: adminUserAPI.remove,
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });

      const userId = variables; // remove(userId)
      if (userId) {
        queryClient.removeQueries({ queryKey: DETAIL_KEY(userId) });
      }
    },
    onError: (err) => handleApiError(err, "adminUser.remove"),
  });

  return { create, update, remove };
}
