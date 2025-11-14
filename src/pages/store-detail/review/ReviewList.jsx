import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { reviewAPI } from "@/service/reviewAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import ReviewItem from "@/components/review/ReviewItem";
import Pagination from "@/components/common/Pagination";
import EmptyState from "../../../components/menu/EmptyState";
import { FaRegCommentDots } from "react-icons/fa";

export default function ReviewList({ storeId }) {
  const [page, setPage] = useState(0);
  const handleError = useHandleError();

  /** 리뷰 요청 */
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.STORE_REVIEW_LIST, storeId, page],
    queryFn: () => reviewAPI.getStoreReviews(storeId, { page }),
    onError: handleError,
    keepPreviousData: true,
  });

  const content = data?.response?.content ?? [];
  const pageInfo = data?.response?.pageInfo;

  return (
    <div className="review-list-wrap">
      {content.length === 0 && (
        <EmptyState
          icon={<FaRegCommentDots size={40} />}
          title={"아직 등록된 리뷰가 없습니다."}
          description={""}
        />
      )}

      {/* 리뷰 목록 */}
      {content.length > 0 &&
        content.map((review) => (
          <ReviewItem key={review.reviewId} review={review} role="store" />
        ))}

      {/* 페이지네이션 */}
      <Pagination pageInfo={pageInfo} onPageChange={setPage} />
    </div>
  );
}
