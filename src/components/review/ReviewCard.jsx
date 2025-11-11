import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import ReviewModal from "./ReviewModal";
import ReviewSwiper from "./ReviewSwiper";

/**
 * ReviewCard (리뷰 카드 공용)
 * --------------------------------------------------
 * - 리뷰 목록(내 리뷰, 가게 리뷰, 점주 리뷰 등)에서 공용 사용
 * - props:
 *   review: 리뷰 객체
 *   type: "user" | "owner" | "store"
 *   onDelete: 삭제 핸들러
 */
export default function ReviewCard({ review, type = "user", onDelete }) {
  const [isSwiperOpen, setSwiperOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  const {
    reviewId,
    rating,
    content,
    createDate,
    fileList = [],
    reply,
    order,
  } = review;

  /** 이미지 URL 리스트 */
  const images = fileList.map((f) => getAbsoluteImageUrl(f)).filter(Boolean);

  /** 날짜 포맷 */
  const formattedDate = createDate?.split(" ")[0] ?? "";

  return (
    <div className="review-card">
      {/* 상단 - 가게명 / 주문메뉴 */}
      <div className="review-header">
        <h4 className="store-name">{order?.storeName || "가게명 없음"}</h4>
        <p className="order-summary">
          {order?.itemList
            ?.map((item) => `${item.menuName} (${item.quantity}개)`)
            .join(", ")}
          <span className="order-date"> / {formattedDate}</span>
        </p>
      </div>

      {/* 별점 */}
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((num) => (
          <FaStar
            key={num}
            size={20}
            className={`star ${num <= rating ? "active" : ""}`}
          />
        ))}
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

      {/* 버튼 영역 */}
      {type === "user" && (
        <div className="review-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setEditOpen(true)}
          >
            수정
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete?.(reviewId)}
          >
            삭제
          </button>
        </div>
      )}

      {/* 점주 답글 */}
      {reply && (
        <div className="review-reply">
          <p className="reply-content">{reply.content}</p>
          <span className="reply-date">{reply.updateDate?.split(" ")[0]}</span>
        </div>
      )}

      {/* 이미지 스와이퍼 (클릭 시 전체보기) */}
      {isSwiperOpen && (
        <ReviewSwiper images={images} onClose={() => setSwiperOpen(false)} />
      )}

      {/* 수정 모달 */}
      {isEditOpen && (
        <ReviewModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          mode="edit"
          order={order}
          defaultValues={review}
          onSubmit={(formData) => {
            console.log("✏️ 수정 formData:", [...formData.entries()]);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
