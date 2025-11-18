// src/pages/mypage/MypageReview.jsx
import React, { useState } from "react";
import { authStore } from "@/store/authStore";
import { useStore } from "@/hooks/useStore";
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
 * - 점주: 내 가게 리뷰 (storeId 필요)
 */
export default function MypageReview() {
  const { userRole, token } = authStore();
  const isLoggedIn = !!token;

  const isOwner = userRole?.includes("OWNER");
  const role = isOwner ? "owner" : "user";

  const [page, setPage] = useState(0);

  // 공통 에러 핸들링
  const handleError = useHandleError();

  /** 점주일 때 storeId 필요 */
  const { myStore } = useStore();
  const storeId = myStore?.storeId;

  const enableFetch =
    isLoggedIn && (role === "user" || (role === "owner" && !!storeId));

  /** 리뷰 조회 */
  const { data, isFetching } = useReviewList(page, role, storeId, enableFetch);

  /** 리뷰 삭제 */
  const { removeReview } = useReviewUpdate();

  /** 안전한 데이터 파싱 */
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
    removeReview.mutate(reviewId);
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
