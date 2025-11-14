import React from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./ReviewTabContent.module.scss";

import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";

/**
 * ReviewTabContent
 * ---------------------------------------------------------
 * - Outlet context에서 storeDetail 받아옴
 * - 상단 Summary에 별점/리뷰수 전달
 */
export default function ReviewTabContent() {
  const { storeDetail } = useOutletContext();

  if (!storeDetail) return null;

  return (
    <div className={styles.container}>
      <ReviewSummary
        ratingAvg={storeDetail.ratingAvg}
        reviewCount={storeDetail.reviewCount}
      />
      <ReviewList storeId={storeDetail.storeId} />
    </div>
  );
}
