import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUtensils } from "react-icons/fa";
import orderAPI from "@/service/orderAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import OrderList from "@/components/mypage/OrderList";
import OrderStatusCard from "./OrderStatusCard";
import styles from "./OrderStatus.module.scss";

export default function OrderStatus() {
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_RECENT_LIST, page],
    queryFn: () => orderAPI.getRecentMyOrders(page),
    keepPreviousData: true,
  });

  const orders = data?.content || [];
  const pageInfo = data?.pageInfo;

  if (!orders.length)
    return (
      <div className="page-wrap">
        <EmptyState
          icon={<FaUtensils />}
          title="주문 내역이 없습니다"
          description="최근 24시간 이내 주문 내역이 표시됩니다."
        />
      </div>
    );

  return (
    <div className={`${styles.orderWrap} page-wrap`}>
      <h2 className="page-title">주문 현황</h2>
      <p className="page-txt">최근 24시간 이내의 주문 내역만 표시됩니다.</p>

      <div className={styles.orders}>
        {orders.map((order) => (
          <OrderStatusCard
            key={order.orderId}
            order={order}
            onSelect={() => setSelectedOrder(order)}
          />
        ))}
      </div>

      {pageInfo && <Pagination pageInfo={pageInfo} onPageChange={setPage} />}

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="주문 상세"
        >
          <OrderList data={[selectedOrder]} type="user" readOnly />
        </Modal>
      )}
    </div>
  );
}
