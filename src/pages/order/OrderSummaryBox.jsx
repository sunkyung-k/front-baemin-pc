import React, { useState } from "react";
import { formatPrice } from "@/utills/valueFormatter";
import PointChargeModal from "@/components/common/PointChargeModal";
import styles from "./OrderSummaryBox.module.scss";
import stylesLayout from "./OrderLayout.module.scss";

export default function OrderSummaryBox({
  productTotal,
  finalTotal,
  myDeposit,
  isLackPoint,
  handleOrder,
  orderPending,
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleChargeClick = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleSuccess = () => {
    // ✅ 충전 성공 → useAccount 내부 invalidate로 자동 리프레시
    setModalOpen(false);
  };

  return (
    <>
      <div className={`${styles.summaryArea} ${stylesLayout.cartArea}`}>
        <h3>결제 요약</h3>

        <div className={styles.summaryRow}>
          <span>상품 금액</span>
          <span>{formatPrice(productTotal)}원</span>
        </div>

        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>총 결제 금액</span>
          <span>{formatPrice(finalTotal)}원</span>
        </div>

        <div className={styles.summaryFooter}>
          <div className={styles.myPoint}>
            <span>보유 포인트</span>
            <strong>{formatPrice(myDeposit)}원</strong>
          </div>

          {isLackPoint ? (
            <div className={styles.actionGroup}>
              <button
                type="button"
                className="btn btn-default btn-danger"
                onClick={handleChargeClick}
              >
                포인트 충전하기
              </button>

              <div className={styles.warning}>
                <div className={styles.warningTop}>포인트가 부족합니다.</div>
                <div className={styles.warningDesc}>
                  충전 후 다시 결제해주세요.
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-default btn-primary"
              onClick={handleOrder}
              disabled={orderPending}
            >
              {orderPending ? "결제 중..." : "결제하기"}
            </button>
          )}
        </div>
      </div>

      <PointChargeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
