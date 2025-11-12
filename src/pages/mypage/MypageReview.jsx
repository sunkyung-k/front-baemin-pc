import React, { useState } from "react";
import { authStore } from "@/store/authStore";
import { useReview } from "@/hooks/useReview"; // 등록 전용 훅 (create 유지)
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate"; // 수정·삭제 훅
import Card from "@/components/mypage/Card";
import ReviewList from "@/components/review/ReviewList";
import Pagination from "@/components/common/Pagination";
import { useHandleError } from "@/hooks/common/useHandleError";

/**
 * MypageReview (내 리뷰 / 내 가게 리뷰 공용 페이지)
 * ------------------------------------------------------
 * - USER: 내가 작성한 리뷰 목록
 * - OWNER: 내 가게에 달린 리뷰 목록
 * - 등록은 useReview, 수정·삭제는 useReviewUpdate로 분리
 */
export default function MypageReview() {
  const { userRole } = authStore();
  const isOwner = userRole?.includes("OWNER");
  const role = isOwner ? "owner" : "user";

  const [page, setPage] = useState(0);
  const handleError = useHandleError();

  /** 리뷰 목록 (role별 API 자동 분기) */
  const { myReviewQuery } = useReview(page, role);

  /** 리뷰 수정·삭제 훅 (서버 캐시 즉시 반영) */
  const { deleteReview } = useReviewUpdate();

  /** 안전한 데이터 추출 */
  const data = myReviewQuery?.data;
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

  /** 페이지 변경 */
  const handlePageChange = (newPage) => setPage(newPage);

  /** ✅ 리뷰 삭제 핸들러 */
  const handleDelete = (reviewId) => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        console.info("🗑️ 리뷰 삭제 성공:", reviewId);
      },
      onError: (err) => handleError(err, "MypageReview.handleDelete"),
    });
  };

  if (myReviewQuery.isLoading) return <div>로딩 중...</div>;

  return (
    <Card title={isOwner ? "내 가게 리뷰 관리" : "내 리뷰 내역"}>
      <ReviewList data={reviews} role={role} onDelete={handleDelete} />

      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </Card>
  );
}
