import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * useReviewList
 * -------------------------------------------------
 * - 유저: 내가 작성한 리뷰 목록
 * - 점주: 내 가게 리뷰 목록
 * - storeId 변화를 감지하도록 수정 (핵심)
 * - owner 의 경우 storeId 없으면 호출 금지
 */
export const useReviewList = (
  page = 0,
  role = "user",
  storeId = null,
  enabled = true
) => {
  const handleError = useHandleError();

  const { data, isLoading, isError, refetch } = useQuery({
    /** storeId를 key에 반드시 포함해야 refetch됨 */
    queryKey: [QUERY_KEYS.MY_REVIEW_LIST, page, role, storeId],

    /** owner일 때 storeId 함께 전달 */
    queryFn: () =>
      role === "owner"
        ? reviewAPI.getMyStoreReviews({ page, storeId })
        : reviewAPI.getMyReviews({ page }),

    enabled, // component 에서: role === "user" || !!storeId 로 사용

    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,

    onError: (err) => handleError(err, "useReviewList"),
  });

  return { data, isLoading, isError, refetch };
};
