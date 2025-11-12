import React from "react";
import ReviewItem from "./ReviewItem";
import EmptyState from "../menu/EmptyState";
import { FaRegCommentDots } from "react-icons/fa";

/**
 * ReviewList (리뷰 목록 공용)
 * --------------------------------------------------
 * @param {Array} data - 리뷰 리스트
 * @param {"user"|"owner"} role - 역할
 * @param {Function} onDelete - 리뷰 삭제 핸들러
 */
export default function ReviewList({ data = [], role = "user", onDelete }) {
  if (!data?.length) {
    return (
      <EmptyState
        icon={<FaRegCommentDots size={40} />}
        title={
          role === "owner"
            ? "아직 등록된 리뷰가 없습니다."
            : "아직 작성한 리뷰가 없습니다."
        }
        description={
          role === "owner"
            ? "고객이 남긴 리뷰가 여기에 표시됩니다."
            : "주문 후 리뷰를 작성해보세요."
        }
      />
    );
  }

  return (
    <div className="review-list">
      {data.map((review) => (
        <ReviewItem
          key={review.reviewId}
          review={review}
          role={role}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
