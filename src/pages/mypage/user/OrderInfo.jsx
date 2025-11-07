import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import orderAPI from "@/service/orderAPI";
import { FaUtensils } from "react-icons/fa";

import Card from "@/components/mypage/Card";
import EmptyState from "@/components/menu/EmptyState";
import OrderList from "../../../components/mypage/OrderList";
// import ReviewModal from "@/components/common/ReviewModal";

export default function OrderInfo() {
  const handleError = useHandleError();
  const afterMutation = useAfterMutation(AFTER_TYPES.LIST);

  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /** ✅ 주문 리스트 조회 */
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDER_LIST, page],
    queryFn: () => orderAPI.getMyOrders(page),
    onError: handleError,
  });

  // ✅ 백엔드 pageHTML 사용 (대문자 H 주의)
  const orders = data?.response?.content || [];
  const total = data?.response?.total || 0;
  const pageHtml = data?.response?.pageHTML || ""; // ✅ 수정 포인트 (pageHtml → pageHTML)

  /** ✅ 리뷰쓰기 버튼 클릭 */
  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setReviewOpen(true);
  };

  /** ✅ 리뷰 작성 완료 후 목록 새로고침 */
  const handleReviewComplete = async () => {
    await afterMutation([QUERY_KEYS.MY_ORDER_LIST]);
    setReviewOpen(false);
    setSelectedOrder(null);
  };

  /** ✅ 백엔드 onclick용 movePage 함수 정의 */
  window.movePage = function (newPage) {
    setPage(newPage);
  };

  /** ✅ 페이지 변경 함수 (기존 유지) */
  const handlePageChange = (newPage) => setPage(newPage);

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
            data={orders}
            type="user"
            onReviewClick={handleReviewClick}
          />

          {/* ✅ 백엔드가 내려준 HTML 그대로 렌더링 */}
          {pageHtml && (
            <ul
              className="pagination-box"
              dangerouslySetInnerHTML={{ __html: pageHtml }}
            ></ul>
          )}
        </>
      )}

      {/* ✅ 리뷰쓰기 모달 (다음 단계에서 연결)
      {isReviewOpen && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setReviewOpen(false)}
          onComplete={handleReviewComplete}
          orderData={selectedOrder}
        />
      )} */}
    </Card>
  );
}
