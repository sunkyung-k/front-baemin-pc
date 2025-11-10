import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "@/components/mypage/OrderList";
import Pagination from "@/components/common/Pagination";

export default function OrderInfo() {
  const handleError = useHandleError();
  const afterMutation = useAfterMutation(AFTER_TYPES.LIST);
  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /** 주문 리스트 조회 */
  const { data, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    onError: handleError,
  });

  if (isLoading) return <div>로딩 중...</div>;

  const orders = data?.content || [];
  const pageInfo = data?.pageInfo;

  /** 주문 상태 변경 */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      await afterMutation([QUERY_KEYS.MY_ORDER_LIST, page]);
      refetch();
    } catch (err) {
      handleError(err);
    }
  };

  /** 리뷰쓰기 버튼 클릭 */
  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setReviewOpen(true);
  };

  /** 리뷰 작성 완료 후 목록 새로고침 */
  const handleReviewComplete = async () => {
    await afterMutation([QUERY_KEYS.MY_ORDER_LIST, page]);
    setReviewOpen(false);
    setSelectedOrder(null);
  };

  /** 페이지 이동 */
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <Card title="주문 정보">
      {orders.length === 0 ? (
        <EmptyState
          icon={<FaUtensils />}
          title="주문 내역이 없습니다."
          description="최근 주문하신 내역이 여기에 표시됩니다."
        />
      ) : (
        <>
          <OrderList
            key={`user-order-list-${page}`}
            data={orders}
            type="user"
            refreshTrigger={page}
            onReviewClick={handleReviewClick}
            onStatusChange={handleStatusChange}
          />

          {pageInfo && (
            <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </Card>
  );
}
