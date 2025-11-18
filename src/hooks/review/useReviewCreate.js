import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import orderAPI from "@/service/orderAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import { authStore } from "@/store/authStore";

/**
 * useReviewCreate
 * -------------------------------------------------------
 * - 유저 주문 목록 조회 + 리뷰 등록 전용
 * - 유저 변경 시 queryKey 변경되어 자동 refetch (정석)
 * - 등록 성공 시: 버튼 숨김 + 서버 invalidate
 */
export const useReviewCreate = (page = 0, role = "user") => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  // 로그인 사용자 ID
  const { userId } = authStore.getState();

  /** 주문 목록 (유저 전용) */
  const orderQuery = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, userId, page],
    queryFn: () => orderAPI.getMyOrders(page),
    enabled: role === "user" && !!userId,
    staleTime: 1000 * 60 * 3,
    onError: (err) => handleError(err, "useReviewCreate.orderQuery"),
  });

  /** 리뷰 등록 */
  const createReview = useMutation({
    mutationFn: reviewAPI.create,
    onSuccess: async (_, formData) => {
      const orderId = Number(formData.get("orderId"));
      console.info("리뷰 등록 성공:", orderId);

      // React Query 캐시 즉시 반영
      queryClient.setQueryData(
        [QUERY_KEYS.MY_ORDER_LIST, userId, page],
        (prev) => {
          if (!prev) return prev;

          const response =
            prev?.response ??
            prev?.data?.response ??
            prev?.data?.data?.response ??
            null;

          if (!response?.content) return prev;

          const newContent = response.content.map((order) =>
            order.orderId === orderId ? { ...order, reviewed: true } : order
          );

          return { ...prev, response: { ...response, content: newContent } };
        }
      );

      // 서버 invalidate
      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_ORDER_LIST, userId]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST, userId]),
      ]);
    },
    onError: (err) => handleError(err, "useReviewCreate.createReview"),
  });

  return { orderQuery, createReview };
};
