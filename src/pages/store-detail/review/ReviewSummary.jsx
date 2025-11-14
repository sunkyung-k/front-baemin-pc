import React from "react";
import styles from "./ReviewSummary.module.scss";
import { FaStar, FaCommentDots } from "react-icons/fa6";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";

/**
 * ReviewSummary
 * ---------------------------------------------------------
 * - 평균 평점 + 리뷰 개수 표시
 */
export default function ReviewSummary({ ratingAvg = 0, reviewCount = 0 }) {
  const displayRating = Number(ratingAvg)?.toFixed(1);

  return (
    <div className={styles.summaryBox}>
      <div className={styles.ratingBox}>
        <strong>사용자 총 평점</strong>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((num) => (
            <FaStar
              key={num}
              size={30}
              className={`star ${
                num <= Math.round(displayRating) ? "active" : ""
              }`}
            />
          ))}
        </div>
        <span className={styles.ratingText}>
          {displayRating} <span>/5</span>
        </span>
      </div>

      <div className={styles.reviewBox}>
        <strong>전체 리뷰수</strong>
        <FaCommentDots className={styles.reviewIcon} size={30} />
        <p className={styles.reviewCountText}>{reviewCount}</p>
      </div>
    </div>
  );
}
