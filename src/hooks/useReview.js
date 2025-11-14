import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import orderAPI from "@/service/orderAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useReview (정식 버전 확장)
 * -------------------------------------------------------
 * - 유저/점주 구분에 따라 각각 다른 리뷰 API 호출
 * - 리뷰 등록 시: 즉시 버튼 사라짐 + 서버 데이터 자동 동기화
 */
export const useReview = (page = 0, role = "user", storeId = null) => {
  const queryClient = useQueryClient();
  const handleError = useHandleError();

  /** 주문 목록 (유저 전용) */
  const orderQuery = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    enabled: role === "user",
    staleTime: 1000 * 60 * 3,
    onError: (err) => handleError(err, "useReview.orderQuery"),
  });

  const myReviewQuery = useQuery({
    queryKey: [QUERY_KEYS.MY_REVIEW_LIST, page, role, storeId],
    queryFn: () =>
      role === "owner"
        ? reviewAPI.getMyStoreReviews({ page, storeId })
        : reviewAPI.getMyReviews({ page }),
    enabled: role === "user" || !!storeId,
    staleTime: 1000 * 60 * 3,
    onError: (err) => handleError(err, "useReview.myReviewQuery"),
  });

  /** 리뷰 등록 */
  const createReview = useMutation({
    mutationFn: reviewAPI.create,
    onSuccess: async (_, formData) => {
      const orderId = Number(formData.get("orderId"));
      console.info("리뷰 등록 성공:", orderId);

      // 즉시 캐시 수정
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

        const newResponse = { ...response, content: [...newContent] };
        if (prev.response) return { ...prev, response: newResponse };
        else if (prev.data?.response)
          return { ...prev, data: { ...prev.data, response: newResponse } };
        else if (prev.data?.data?.response)
          return {
            ...prev,
            data: {
              ...prev.data,
              data: { ...prev.data.data, response: newResponse },
            },
          };
        return prev;
      });

      // 서버 invalidate
      await Promise.all([
        queryClient.invalidateQueries([QUERY_KEYS.MY_ORDER_LIST]),
        queryClient.invalidateQueries([QUERY_KEYS.MY_REVIEW_LIST]),
      ]);
    },
    onError: (err) => handleError(err, "useReview.createReview"),
  });

  return { orderQuery, myReviewQuery, createReview };
};
