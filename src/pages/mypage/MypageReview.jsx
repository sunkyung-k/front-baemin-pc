import React, { useState } from "react";
import { authStore } from "@/store/authStore";
import { useReviewList } from "@/hooks/review/useReviewList";
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate";
import Card from "@/components/mypage/Card";
import ReviewList from "@/components/review/ReviewList";
import Pagination from "@/components/common/Pagination";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * MypageReview (내 리뷰 / 내 가게 리뷰)
 * --------------------------------------------------
 * - 유저: 내가 쓴 리뷰
 * - 점주: 내 가게 리뷰
 * - 수정/삭제는 useReviewUpdate 훅으로
 */
export default function MypageReview() {
  const { userRole } = authStore();
  const isOwner = userRole?.includes("OWNER");
  const role = isOwner ? "owner" : "user";

  const [page, setPage] = useState(0);
  const handleError = useHandleError();

  const { data } = useReviewList(page, role);
  const { updateReview, removeReview } = useReviewUpdate();

  const reviews =
    data?.response?.content ??
    data?.data?.response?.content ??
    data?.data?.data?.response?.content ??
    [];

  const pageInfo =
    data?.response?.pageInfo ??
    data?.data?.response?.pageInfo ??
    data?.data?.data?.response?.pageInfo ??
    null;

  const handlePageChange = (newPage) => setPage(newPage);

  const handleDelete = (reviewId) => {
    removeReview.mutate(reviewId, {
      onError: (err) => handleError(err, "MypageReview.handleDelete"),
    });
  };

  return (
    <Card title={isOwner ? "내 가게 리뷰 관리" : "내 리뷰 내역"}>
      <ReviewList data={reviews} role={role} onDelete={handleDelete} />
      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </Card>
  );
}
