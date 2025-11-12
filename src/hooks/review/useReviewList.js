import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useReviewList
 * -------------------------------------------------
 * - 유저: 내가 작성한 리뷰 목록
 * - 점주: 내 가게 리뷰 목록
 * - page 기반 pagination
 */
export const useReviewList = (page = 0, role = "user") => {
  const handleError = useHandleError();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.MY_REVIEW_LIST, page, role],
    queryFn: () =>
      role === "owner"
        ? reviewAPI.getMyStoreReviews({ page })
        : reviewAPI.getMyReviews({ page }),
    staleTime: 1000 * 60 * 3, // 3분 캐싱
    onError: (err) => handleError(err, "useReviewList"),
  });

  return { data, isLoading, isError, refetch };
};
