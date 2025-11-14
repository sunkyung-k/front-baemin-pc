import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import ReviewReplyBox from "./ReviewReplyBox";
import ReviewSwiper from "./ReviewSwiper";
import ReviewModal from "./ReviewModal";
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate";
import { useAdminReview } from "@/hooks/admin/useAdminReview";
import { authStore } from "@/store/authStore";

/**
 * ReviewItem (리뷰 카드 공용)
 * --------------------------------------------------
 * - role: "user" | "owner" | "store" | "admin"
 * - review: 리뷰 데이터
 * - onDelete: 상위 리스트 동기화를 위한 삭제 핸들러 (선택)
 */
export default function ReviewItem({ review, role = "user", onDelete }) {
  const [isSwiperOpen, setSwiperOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { updateReview, removeReview } = useReviewUpdate();
  const { reviewDelete, replyDelete } = useAdminReview();

  const loginRole = authStore.getState().userRole;

  if (!review) return null;

  const {
    reviewId,
    rating,
    content,
    writer,
    fileList = [],
    reply,
    order,
    delYn,
  } = review;

  // ⭐ 삭제된 리뷰 체크
  const isDeletedByAdmin =
    delYn === "A" || content === "해당 리뷰는 관리자에 의해 삭제된 리뷰입니다.";

  const toggleExpand = () => setExpanded((prev) => !prev);
  const images = fileList.map((f) => getAbsoluteImageUrl(f)).filter(Boolean);

  /** 리뷰 수정 */
  const handleEditSubmit = (formData) => {
    updateReview.mutate(formData, {
      onSuccess: () => setEditOpen(false),
    });
  };

  /** 유저 리뷰 삭제 */
  const handleUserDelete = () => {
    removeReview.mutate(reviewId, {
      onSuccess: () => onDelete?.(reviewId),
    });
  };

  /** 관리자 리뷰 삭제 */
  const handleAdminReviewDelete = () => {
    if (!window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;

    reviewDelete.mutate(reviewId, {
      onSuccess: () => onDelete?.(reviewId),
    });
  };

  /** 관리자 답변 삭제 */
  const handleAdminReplyDelete = () => {
    if (!reply) return;
    if (!window.confirm("정말 이 답변을 삭제하시겠습니까?")) return;

    replyDelete.mutate(reply.reviewReplyId, {
      onSuccess: () => {
        review.reply = null;
      },
    });
  };

  /** 표시명 */
  const displayName =
    role === "user"
      ? order?.storeName || "가게명 없음"
      : writer || "작성자 없음";

  const isAdmin = loginRole === "ROLE_ADMIN";

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

        {/* 유저 수정/삭제 (삭제된 리뷰면 숨김) */}
        {role === "user" && !isDeletedByAdmin && (
          <div className="review-actions">
            <button
              className="btn btn-secondary-line btn-sm"
              onClick={() => setEditOpen(true)}
            >
              수정
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleUserDelete}
            >
              삭제
            </button>
          </div>
        )}

        {/* 관리자 삭제 버튼 (삭제 리뷰는 숨김) */}
        {isAdmin && !isDeletedByAdmin && (
          <div className="review-actions">
            <button
              className="btn btn-danger btn-sm"
              onClick={handleAdminReviewDelete}
            >
              리뷰 삭제
            </button>

            {reply && (
              <button
                className="btn btn-secondary-line btn-sm"
                onClick={handleAdminReplyDelete}
              >
                답변 삭제
              </button>
            )}
          </div>
        )}
      </div>

      {/* 상단 정보 */}
      <div className="review-info">
        <div className="review-info-top">
          <strong className="store-name">{displayName}</strong>
          <span className="order-date"> / {order?.orderDate ?? ""}</span>
        </div>

        {/* 주문 요약 */}
        {order?.itemList && (
          <div
            className={`order-summary ${expanded ? "expanded" : ""}`}
            onClick={toggleExpand}
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

      {/* 리뷰 내용  */}
      <p
        className={`review-content ${isDeletedByAdmin ? "deleted-review" : ""}`}
      >
        {content}
      </p>

      {/* 이미지 */}
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

      {/* 답글 — 삭제되면 readOnly */}
      <ReviewReplyBox
        reply={review.reply ?? null}
        reviewId={reviewId}
        isReadOnly={role !== "owner" || isDeletedByAdmin}
      />

      {/* 전체보기 */}
      {isSwiperOpen && (
        <ReviewSwiper images={images} onClose={() => setSwiperOpen(false)} />
      )}

      {/* 수정모달 */}
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
