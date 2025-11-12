import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import ReviewActions from "./ReviewActions";
import ReviewReplyBox from "./ReviewReplyBox";
import ReviewSwiper from "./ReviewSwiper";
import ReviewModal from "./ReviewModal";
import { useReviewUpdate } from "@/hooks/review/useReviewUpdate";

/**
 * ReviewItem (리뷰 카드 공용)
 * --------------------------------------------------
 * - role: "user" | "owner"
 * - review: 리뷰 데이터
 * - onDelete: 상위 리스트 동기화를 위한 삭제 핸들러 (선택)
 */
export default function ReviewItem({ review, role = "user", onDelete }) {
  const [isSwiperOpen, setSwiperOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /** ✅ 수정 / 삭제 훅 */
  const { updateReview, deleteReview } = useReviewUpdate();

  const toggleExpand = () => setExpanded((prev) => !prev);

  const {
    reviewId,
    rating,
    content,
    // orderDate,
    fileList = [],
    reply,
    order,
  } = review;

  /** 이미지 URL 변환 */
  const images = fileList.map((f) => getAbsoluteImageUrl(f)).filter(Boolean);

  /** ✅ 리뷰 수정 */
  const handleEditSubmit = (formData) => {
    updateReview.mutate(formData, {
      onSuccess: () => {
        setEditOpen(false); // 수정 완료 후 모달 닫기
      },
    });
  };

  /** ✅ 리뷰 삭제 */
  const handleDelete = () => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        onDelete?.(reviewId); // 상위 목록에서 제거
      },
    });
  };

  return (
    <div className="review-card">
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
      {/* 상단 - 가게명 / 주문메뉴 */}
      <div className="review-header">
        <div className="review-header-top">
          <strong className="store-name">
            {order?.storeName || "가게명 없음"}
          </strong>
          <span className="order-date"> / {order?.orderDate ?? ""}</span>
        </div>

        <div
          className={`order-summary ${expanded ? "expanded" : ""}`}
          onClick={toggleExpand}
          role="button"
          tabIndex={0}
        >
          <p className="order-txt">
            {order?.itemList
              ?.map((item) => {
                const options =
                  item.optionNames && item.optionNames.length > 0
                    ? `(${item.optionNames.join(", ")})`
                    : "";
                return `${item.menuName}${options} x${item.quantity}`;
              })
              .join(", ")}
          </p>

          <p className="order-button">{expanded ? "접기" : ""}</p>
        </div>
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

      {/* 버튼/답글 영역 */}
      <ReviewActions
        role={role}
        reply={reply}
        onEdit={() => setEditOpen(true)}
        onDelete={handleDelete}
      />

      {role === "owner" && <ReviewReplyBox reply={reply} reviewId={reviewId} />}

      {/* 이미지 전체보기 */}
      {isSwiperOpen && (
        <ReviewSwiper images={images} onClose={() => setSwiperOpen(false)} />
      )}

      {/* ✅ 수정 모달 */}
      {isEditOpen && (
        <ReviewModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          mode="edit"
          order={order}
          defaultValues={review}
          onSubmit={handleEditSubmit} // ✅ 수정 시 useReviewUpdate로 전달
        />
      )}
    </div>
  );
}
