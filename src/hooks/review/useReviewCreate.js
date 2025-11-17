import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import orderAPI from "@/service/orderAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useReviewCreate
 * -------------------------------------------------------
 * - 유저 주문 목록 조회 + 리뷰 등록 전용
 * - 등록 성공 시: 버튼 숨김 + 서버 invalidate
 */
export const useReviewCreate = (page = 0, role = "user") => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  /** 주문 목록 (유저 전용) */
  const orderQuery = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    enabled: role === "user",
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
      queryClient.setQueryData([QUERY_KEYS.MY_ORDER_LIST, page], (prev) => {
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
      });

      // 서버 invalidate
      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_ORDER_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]),
      ]);
    },
    onError: (err) => handleError(err, "useReviewCreate.createReview"),
  });

  return { orderQuery, createReview };
};
