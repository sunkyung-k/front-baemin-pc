import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminUserAPI from "@/service/admin/adminUserAPI";
import { handleApiError } from "@/utills/handleApiError";

export function useAdminUserList(params) {
  return useQuery({
    queryKey: ["adminUserList", params],
    queryFn: () => adminUserAPI.getList(params),
    onError: (err) => handleApiError(err, "getUserList"),
  });
}

export function useAdminUserDetail(userId) {
  return useQuery({
    queryKey: ["adminUserDetail", userId],
    queryFn: () => adminUserAPI.getDetail(userId),
    enabled: !!userId,
  });
}

const queryKey = ["adminUserList"];

export function useAdminUserMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: adminUserAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: adminUserAPI.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: adminUserAPI.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { create, update, remove };
}
