import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import ReviewReplyBox from "./ReviewReplyBox";
import ReviewSwiper from "./ReviewSwiper";
import ReviewModal from "./ReviewModal";
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate";
import { useAdminReview } from "@/hooks/admin/useAdminReview";
import { authStore } from "@/store/authStore";

/* ============================================================
   전역 모달(root)로 ReviewSwiper 띄우는 함수
============================================================ */
function openReviewSwiperGlobal(images) {
  const root = document.getElementById("global-modal-root");
  if (!root) return;

  // 기존 모달 비우기
  root.innerHTML = "";

  // 컨테이너 생성
  const container = document.createElement("div");
  root.appendChild(container);

  const modalRoot = createRoot(container);

  modalRoot.render(
    <ReviewSwiper
      images={images}
      onClose={() => {
        modalRoot.unmount();
        root.innerHTML = "";
      }}
    />
  );
}

/**
 * ReviewItem (리뷰 카드 공용)
 * --------------------------------------------------
 * - role: "user" | "owner" | "store" | "admin"
 * - review: 리뷰 데이터
 * - onDelete: 상위 리스트 동기화를 위한 삭제 핸들러 (선택)
 */
export default function ReviewItem({ review, role = "user", onDelete }) {
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
    removeReview.mutate(reviewId);
  };

  /** 관리자 리뷰 삭제 */
  const handleAdminReviewDelete = () => {
    if (!window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;

    reviewDelete.mutate(reviewId);
  };

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

        {/* 유저 수정/삭제 */}
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

        {/* 관리자 삭제 버튼 */}
        {isAdmin && !isDeletedByAdmin && (
          <div className="review-actions">
            <button
              className="btn btn-danger btn-sm"
              onClick={handleAdminReviewDelete}
            >
              리뷰 삭제
            </button>
          </div>
        )}
      </div>

      {/* 상단 정보 */}

      <div className="review-info">
        {!isDeletedByAdmin && (
          <div className="review-info-top">
            <strong className="store-name">{displayName}</strong>
            <span className="order-date"> / {order?.orderDate ?? ""}</span>
          </div>
        )}

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

      {/* 리뷰 내용 */}
      <p
        className={`review-content ${isDeletedByAdmin ? "deleted-review" : ""}`}
      >
        {content}
      </p>

      {/* 이미지 썸네일 */}
      {images.length > 0 && (
        <div className="review-thumbnails">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`리뷰이미지${idx + 1}`}
              onClick={() => openReviewSwiperGlobal(images)}
              className="thumbnail"
            />
          ))}
        </div>
      )}

      {/* 답글 */}
      <ReviewReplyBox
        reply={review.reply ?? null}
        reviewId={reviewId}
        isReadOnly={role !== "owner" || isDeletedByAdmin}
      />

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
