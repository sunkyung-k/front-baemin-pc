import React from "react";
import styles from "./OrderStatusCard.module.scss";

export default function OrderStatusCard({ order, onSelect }) {
  const { orderId, storeName, status, totalPrice, orderDate, itemList } = order;

  const ORDER_STATUS = {
    주문완료: { label: "주문 확인중", progress: 50 },
    주문확인중: { label: "주문 확인중", progress: 50 },
    배달완료: { label: "배달 완료", progress: 100 },
    주문취소: { label: "주문 취소", progress: 0 },
  };

  const { progress } = ORDER_STATUS[status] || ORDER_STATUS["주문완료"];
  const isCanceled = status === "주문취소";
  const isCompleted = status === "배달완료";

  const itemsSummary = itemList
    .map((item) => `${item.menuName} (${item.quantity}개)`)
    .join(", ");

  return (
    <div
      key={orderId}
      className={`${styles.orderCard} ${
        isCompleted || isCanceled ? styles.disabled : ""
      }`}
    >
      <div className={styles.orderHeader}>
        <h4>{storeName}</h4>
        {isCanceled && (
          <span className={`${styles.badge} ${styles.cancel}`}>주문 취소</span>
        )}
      </div>

      <div className={styles.orderDetail}>
        <dl>
          <dt>주문 시간</dt>
          <dd>{orderDate}</dd>

          <dt>주문 내역</dt>
          <dd className="ellipsis">
            <button type="button" onClick={onSelect}>
              {itemsSummary}
            </button>
          </dd>

          <dt>주문 금액</dt>
          <dd>
            <strong>{totalPrice.toLocaleString()}원</strong>
          </dd>
        </dl>
      </div>

      {/* Progress */}
      <div className={styles.steps}>
        {["주문 완료", "주문 확인중", "배달 완료"].map((step, idx) => (
          <span
            key={idx}
            className={`${styles.step} ${
              ["주문완료", "주문확인중", "배달완료"]
                .slice(0, idx + 1)
                .includes(status)
                ? styles.active
                : ""
            }`}
          >
            {step}
          </span>
        ))}
      </div>

      <div
        className={`${styles.progressContainer} ${
          isCompleted ? styles.done : ""
        }`}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
