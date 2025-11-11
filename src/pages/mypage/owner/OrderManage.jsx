import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "@/components/mypage/OrderList";
import SalesSummary from "./SalesSummary";
import Pagination from "@/components/common/Pagination";
import { useOrderStatus } from "@/hooks/useOrderStatus";

export default function OrderManage() {
  const handleError = useHandleError();
  const [page, setPage] = useState(0);
  const { updateStatus } = useOrderStatus(page);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyStoreOrders(page),
    onError: handleError,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <div>로딩 중...</div>;

  const orders = data?.content || [];
  const pageInfo = data?.pageInfo;
  const handlePageChange = (newPage) => setPage(newPage);

  const handleStatusChange = async (orderId, newStatus, order) => {
    await updateStatus(orderId, newStatus, order);
  };

  return (
    <>
      <SalesSummary />

      <Card title="주문 관리">
        {orders.length === 0 ? (
          <EmptyState
            icon={<FaUtensils />}
            title="주문 내역이 없습니다."
            description="최근 주문이 여기에 표시됩니다."
          />
        ) : (
          <>
            <OrderList
              key={`order-list-${page}-${orders[0]?.status ?? ""}`}
              data={orders}
              type="owner"
              refreshTrigger={page}
              onStatusChange={handleStatusChange}
            />

            {pageInfo && (
              <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </Card>
    </>
  );
}
