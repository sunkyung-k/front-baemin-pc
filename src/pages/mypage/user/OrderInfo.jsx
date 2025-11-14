import React, { useEffect, useState } from "react";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useReviewCreate } from "@/hooks/review/useReviewCreate"; // ✅ 등록 전용 훅
import { FaUtensils } from "react-icons/fa";
import Card from "@/components/mypage/Card";
import OrderList from "@/components/mypage/OrderList";
import Pagination from "@/components/common/Pagination";
import ReviewModal from "@/components/review/ReviewModal";
import EmptyState from "@/components/menu/EmptyState";
import { useReviewStore } from "@/store/useReviewStore";

/**
 * OrderInfo (마이페이지 주문 내역)
 * -------------------------------------------------------
 * - 리뷰 등록 전용 (create only)
 * - React Query + Zustand 하이브리드 구조
 * - 등록 성공 시: UI 즉시 반영 + 서버 invalidate
 */
export default function OrderInfo() {
  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleError = useHandleError();
  const { updateStatus } = useOrderStatus(page);
  const { orderQuery, createReview } = useReviewCreate(page, "user");
  const { orders: storeOrders, setOrders, markReviewed } = useReviewStore();

  const orderData = orderQuery.data;

  /** 안전한 content 추출 */
  const getContent = (data) =>
    data?.response?.content ??
    data?.data?.response?.content ??
    data?.data?.content ??
    data?.content ??
    [];

  /** 안전한 pageInfo 추출 */
  const getPageInfo = (data) =>
    data?.response?.pageInfo ??
    data?.data?.response?.pageInfo ??
    data?.data?.pageInfo ??
    data?.pageInfo ??
    null;

  /** 서버 → store 동기화 */
  useEffect(() => {
    const newOrders = getContent(orderData);
    setOrders(newOrders);
  }, [orderData, setOrders, page]);

  const pageInfo = getPageInfo(orderData);

  /** 리뷰 모달 열기 */
  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setReviewOpen(true);
  };

  /** 페이지 변경 */
  const handlePageChange = (newPage) => setPage(newPage);

  /** 리뷰 등록 */
  const handleReviewSubmit = async (formData) => {
    try {
      await createReview.mutateAsync(formData);
      const orderId = Number(formData.get("orderId"));
      markReviewed(orderId);
      alert("리뷰가 성공적으로 등록되었습니다.");
      setReviewOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      handleError(err, "OrderInfo.handleReviewSubmit");
    }
  };

  return (
    <Card title="주문 내역">
      {!storeOrders?.length ? (
        <EmptyState
          icon={<FaUtensils />}
          title="주문 내역이 없습니다."
          description="최근 주문하신 내역이 여기에 표시됩니다."
        />
      ) : (
        <>
          <OrderList
            data={storeOrders}
            type="user"
            onReviewClick={handleReviewClick}
            onStatusChange={updateStatus}
            refreshTrigger={page}
          />

          {pageInfo && (
            <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* 리뷰 등록 모달 */}
      {isReviewOpen && selectedOrder && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setReviewOpen(false)}
          order={selectedOrder}
          onSubmit={handleReviewSubmit}
        />
      )}
    </Card>
  );
}
