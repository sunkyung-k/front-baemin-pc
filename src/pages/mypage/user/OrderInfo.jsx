import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "../../../components/mypage/OrderList";

export default function OrderInfo() {
  const handleError = useHandleError();
  const afterMutation = useAfterMutation(AFTER_TYPES.LIST);
  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /** 주문 리스트 조회 */
  const { data, refetch } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    onError: handleError,
  });

  // 백엔드 pageHTML (대문자 H 주의)
  const orders = data?.response?.content || [];
  const pageHtml = data?.response?.pageHTML || "";

  /** 주문 상태 변경  */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus); // 상태 변경 API 호출
      await afterMutation([QUERY_KEYS.MY_ORDER_LIST, page]); // 캐시 무효화 (page 포함)
      refetch(); // 즉시 재요청 (보장)
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
    await afterMutation([QUERY_KEYS.MY_ORDER_LIST, page]); // 동일 invalidate
    setReviewOpen(false);
    setSelectedOrder(null);
  };

  /** 백엔드 onclick용 movePage 함수 정의 */
  useEffect(() => {
    window.movePage = function (newPage) {
      const safePage = Math.max(Number(newPage), 0);
      console.log("👉 movePage 호출됨:", safePage);
      setPage(safePage);
    };

    // cleanup: 메모리 누수 방지
    return () => {
      delete window.movePage;
    };
  }, []);

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
          {/* 주문 리스트 */}
          <OrderList
            key="user-order-list"
            data={orders}
            type="user"
            refreshTrigger={page} // 페이지 이동 시만 닫기
            onReviewClick={handleReviewClick}
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
  );
}
