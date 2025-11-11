import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "@/components/mypage/OrderList";
import Pagination from "@/components/common/Pagination";
import ReviewModal from "@/components/review/ReviewModal";
import { useOrderStatus } from "@/hooks/useOrderStatus";

export default function OrderInfo() {
  const handleError = useHandleError();
  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { updateStatus } = useOrderStatus(page);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    onError: handleError,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <div>로딩 중...</div>;

  const orders = data?.content || [];
  const pageInfo = data?.pageInfo;
  const handlePageChange = (newPage) => setPage(newPage);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
    } catch (err) {
      handleError(err);
    }
  };

  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setReviewOpen(true);
  };

  const handleReviewComplete = async () => {
    await updateStatus(); // 자동 invalidate 반영
    setReviewOpen(false);
    setSelectedOrder(null);
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
            key={`user-order-list-${page}-${orders[0]?.status ?? ""}`}
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

      {isReviewOpen && selectedOrder && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setReviewOpen(false)}
          mode="create"
          order={selectedOrder}
          onSubmit={(formData) => {
            console.log("리뷰 작성 데이터", [...formData.entries()]);
            handleReviewComplete();
          }}
        />
      )}
    </Card>
  );
}
