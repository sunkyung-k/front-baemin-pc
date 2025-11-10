import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "@/components/mypage/OrderList";
import SalesSummary from "./SalesSummary";

export default function OrderManage() {
  const handleError = useHandleError();
  const afterMutation = useAfterMutation(AFTER_TYPES.LIST);
  const [page, setPage] = useState(0);

  /** 주문 리스트 조회 (React Query) */
  const { data, refetch } = useQuery({
    queryKey: [QUERY_KEYS.MY_STORE_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyStoreOrders(page),
    onError: handleError,
  });

  const orders = data?.response?.content || [];
  const pageHtml = data?.response?.pageHTML || "";

  /** 주문 상태 변경 */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);

      // 현재 점주 페이지 캐시 무효화
      await afterMutation([QUERY_KEYS.MY_STORE_ORDER_LIST, page]);

      // 유저 페이지 캐시도 강제로 invalidate 시켜서 새로고침 없이 갱신되게 함
      await afterMutation([QUERY_KEYS.MY_ORDER_LIST]);

      // 즉시 refetch
      refetch();
    } catch (err) {
      handleError(err);
    }
  };

  /** movePage 함수 (전역 등록 + 안정화) */
  const movePage = useCallback(
    (newPage) => {
      const safePage = Math.max(Number(newPage), 0);
      console.log("👉 movePage 호출됨:", safePage);
      setPage(safePage);
    },
    [setPage]
  );

  useEffect(() => {
    // React에서 렌더링될 때마다 동일한 함수 참조 유지
    window.movePage = movePage;
  }, [movePage]);

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
              key="owner-order-list"
              data={orders}
              type="owner"
              refreshTrigger={page}
              onStatusChange={handleStatusChange}
            />

            {pageHtml && (
              <ul
                className="pagination-box"
                dangerouslySetInnerHTML={{ __html: pageHtml }}
              ></ul>
            )}
          </>
        )}
      </Card>
    </>
  );
}
