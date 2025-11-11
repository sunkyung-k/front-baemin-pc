import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUtensils } from "react-icons/fa";
import orderAPI from "@/service/orderAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import styles from "./OrderStatus.module.scss";
import { useState } from "react";

export default function OrderStatus() {
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST],
    queryFn: () => orderAPI.getMyOrders(0),
  });

  const orders = data?.content || [];
  const [page, setPage] = useState(0);
  const pageInfo = data?.pageInfo;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // 주문이 없는 경우 (EmptyState)
  if (orders.length === 0)
    return (
      <div className="page-wrap">
        <EmptyState
          icon={<FaUtensils />}
          title="주문 현황"
          description="최근 주문하신 내역이 여기에 표시됩니다."
        />
      </div>
    );

  /** 상태별 진행률 계산 */
  const getProgress = (status) => {
    switch (status) {
      case "주문완료":
        return 50;
      case "배달완료":
        return 100;
      case "주문취소":
        return 0;
      default:
        return 10;
    }
  };

  /** 개별 주문 카드 */
  const renderOrderCard = (order) => {
    const { orderId, storeName, status, totalPrice, orderDate, itemList } =
      order;
    const badgeText = status;
    const progress = getProgress(status);

    const itemsSummary = itemList
      .map(
        (item) =>
          `${item.menuName} (${item.quantity}개)${
            item.optionNames?.length ? ` + ${item.optionNames.join(", ")}` : ""
          }`
      )
      .join(", ");

    return (
      <div
        key={orderId}
        className={`${styles.orderCard} ${
          status === "배달완료" ? styles.done : ""
        }`}
        data-status={status}
      >
        <div className={styles.orderHeader}>
          <h4>{storeName}</h4>
          <span className={`${styles.badge} ${styles[status]}`}>
            {badgeText}
          </span>
        </div>

        <div className={styles.orderDetail}>
          주문 내역: {itemsSummary}
          <br />
          주문 금액: <strong>₩{totalPrice.toLocaleString()}</strong>
          <br />
          주문 시간: {orderDate}
        </div>

        <div className={styles.steps}>
          <span className={styles.active}>주문 완료</span>
          <span
            className={
              status === "배달완료" || status === "주문완료"
                ? styles.active
                : ""
            }
          >
            조리중
          </span>
          <span className={status === "배달완료" ? styles.active : ""}>
            배달 완료
          </span>
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrap">
      <h2 className="page-title">주문 현황</h2>
      <div className={styles.orders}>{orders.map(renderOrderCard)}</div>

      {/* 페이지네이션 추가 */}
      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </div>
  );
}
