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
  const { userRole } = authStore();
  const isOwner = userRole?.includes("OWNER");
  const role = isOwner ? "owner" : "user";

  const [page, setPage] = useState(0);
  const handleError = useHandleError();

  /** 점주일 때 storeId 필요 */
  const { myStore, isStoreLoading } = useStore();
  const storeId = myStore?.storeId;

  /** 기본적으로 user는 바로 호출 / owner는 storeId 필요 */
  const enableFetch = role === "user" || !!storeId;

  /** 리뷰 조회 */
  const { data, isFetching } = useReviewList(page, role, storeId, enableFetch);

  const { removeReview } = useReviewUpdate();

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

  /** 점주인데 storeId 아직 로드 안 됨 */
  if (isOwner && !storeId) {
    return (
      <Card title="내 가게 리뷰 관리">
        <p style={{ padding: "20px" }}>가게 정보를 불러오는 중...</p>
      </Card>
    );
  }

  return (
    <Card title={isOwner ? "내 가게 리뷰 관리" : "내 리뷰 내역"}>
      <ReviewList data={reviews} role={role} onDelete={handleDelete} />

      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </Card>
  );
}
