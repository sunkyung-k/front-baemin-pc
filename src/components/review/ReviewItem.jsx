import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import ReviewReplyBox from "./ReviewReplyBox";
import ReviewSwiper from "./ReviewSwiper";
import ReviewModal from "./ReviewModal";
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate";

/**
 * ReviewItem (리뷰 카드 공용)
 * --------------------------------------------------
 * - role: "user" | "owner" | "store"
 * - review: 리뷰 데이터
 * - onDelete: 상위 리스트 동기화를 위한 삭제 핸들러 (선택)
 */
export default function ReviewItem({ review, role = "user", onDelete }) {
  const [isSwiperOpen, setSwiperOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isReplyMode, setReplyMode] = useState(false);

  const { updateReview, removeReview } = useReviewUpdate();

  if (!review) return null;

  const {
    reviewId,
    rating,
    content,
    writer,
    fileList = [],
    reply,
    order,
  } = review;

  const toggleExpand = () => setExpanded((prev) => !prev);
  const images = fileList.map((f) => getAbsoluteImageUrl(f)).filter(Boolean);

  /** 리뷰 수정 */
  const handleEditSubmit = (formData) => {
    updateReview.mutate(formData, { onSuccess: () => setEditOpen(false) });
  };

  /** 리뷰 삭제 */
  const handleDelete = () => {
    removeReview.mutate(reviewId, {
      onSuccess: () => onDelete?.(reviewId),
    });
  };

  /** 상단 표시명 */
  const displayName =
    role === "user"
      ? order?.storeName || "가게명 없음"
      : writer || "작성자 없음";

  return (
    <div className="review-card">
      <div className="review-header">
        {/* 별점 */}
        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((num) => (
            <FaStar
              key={num}
              size={15}
              className={`star ${num <= rating ? "active" : ""}`}
            />
          ))}
        </div>

        {/* 유저 전용: 수정 / 삭제 버튼 */}
        {role === "user" && (
          <div className="review-actions">
            <button
              className="btn btn-secondary-line btn-sm"
              onClick={() => setEditOpen(true)}
            >
              수정
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 상단 - 가게명(유저) or 작성자명(점주/가게상세) */}
      <div className="review-info">
        <div className="review-info-top">
          <strong className="store-name">{displayName}</strong>
          <span className="order-date"> / {order?.orderDate ?? ""}</span>
        </div>

        {/* 주문 항목 요약 */}
        {order?.itemList && (
          <div
            className={`order-summary ${expanded ? "expanded" : ""}`}
            onClick={toggleExpand}
            role="button"
            tabIndex={0}
          >
            <p className="order-txt">
              {order.itemList
                .map((item) => {
                  const options =
                    item.optionNames?.length > 0
                      ? `(${item.optionNames.join(", ")})`
                      : "";
                  return `${item.menuName}${options} x${item.quantity}`;
                })
                .join(", ")}
            </p>
            {expanded && <p className="order-button">접기</p>}
          </div>
        )}
      </div>

      {/* 내용 */}
      <p className="review-content">{content}</p>

      {/* 이미지 썸네일 */}
      {images.length > 0 && (
        <div className="review-thumbnails">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`리뷰이미지${idx + 1}`}
              onClick={() => setSwiperOpen(true)}
              className="thumbnail"
            />
          ))}
        </div>
      )}

      {/* 사장님 답글  */}
      <ReviewReplyBox
        reply={reply}
        reviewId={reviewId}
        onClose={() => setReplyMode(false)}
        onOpen={() => setReplyMode(true)}
        isReadOnly={role !== "owner"} //  점주만 수정 가능
      />

      {/* 이미지 전체보기 */}
      {isSwiperOpen && (
        <ReviewSwiper images={images} onClose={() => setSwiperOpen(false)} />
      )}

      {/* 리뷰 수정 모달 */}
      {isEditOpen && (
        <ReviewModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          mode="edit"
          order={order}
          defaultValues={review}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
