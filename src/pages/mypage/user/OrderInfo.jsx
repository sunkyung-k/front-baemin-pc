import React, { useEffect, useState } from "react";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useReview } from "@/hooks/useReview";
import { FaUtensils } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

import Card from "@/components/mypage/Card";
import OrderList from "@/components/mypage/OrderList";
import Pagination from "@/components/common/Pagination";
import ReviewModal from "@/components/review/ReviewModal";
import EmptyState from "@/components/menu/EmptyState";

import { useReviewStore } from "@/store/useReviewStore";

/**
 * OrderInfo (마이페이지 주문 내역)
 * - React Query로 서버 조회
 * - Zustand(store)로 UI 즉시 반영 (리뷰 등록 직후 버튼 숨김)
 * - 서버 동기화: invalidateQueries
 */
export default function OrderInfo() {
  const [page, setPage] = useState(0);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleError = useHandleError();
  const queryClient = useQueryClient();

  /** hooks */
  const { updateStatus } = useOrderStatus(page);
  //  useReview 훅에서 createReview mutation을 가져와 사용
  const { orderQuery, createReview } = useReview(page);

  /** Zustand store */
  const { orders: storeOrders, setOrders, markReviewed } = useReviewStore();

  const isLoading = orderQuery.isLoading;
  const orderData = orderQuery.data;

  /** 안전한 content 추출 (다중 중첩 구조 커버) */
  const getContent = (data) => {
    if (!data) return [];
    return (
      data?.response?.content ??
      data?.data?.response?.content ??
      data?.data?.content ??
      data?.content ??
      []
    );
  };

  /** 안전한 pageInfo 추출 */
  const getPageInfo = (data) => {
    if (!data) return null;
    return (
      data?.response?.pageInfo ??
      data?.data?.response?.pageInfo ??
      data?.data?.pageInfo ??
      data?.pageInfo ??
      null
    );
  };

  /** 서버에서 내려온 데이터를 store에 동기화 (페이지 이동 시마다 갱신) */
  useEffect(() => {
    const newOrders = getContent(orderData) || [];
    // store에 페이지의 content를 그대로 씀
    setOrders(newOrders);
  }, [orderData, setOrders, page]);

  const pageInfo = getPageInfo(orderData);

  /** 리뷰 모달 오픈 */
  const handleReviewClick = (order) => {
    setSelectedOrder(order);
    setReviewOpen(true);
  };

  /** 페이지 변경 */
  const handlePageChange = (newPage) => setPage(newPage);

  /**  리뷰 등록 최종 핸들러 (ReviewModal의 onSubmit으로 전달) */
  const handleReviewSubmit = async (formData, mode) => {
    try {
      // 1) 리뷰 등록/수정 API 호출 (useReview 훅의 mutation 사용)
      if (mode === "create") {
        await createReview.mutateAsync(formData);
      } else {
        // 수정 로직은 현재 useReview 훅에 없으므로, reviewAPI를 직접 사용
        // 이 부분은 필요하다면 useReview에 updateMutation을 추가할 수 있습니다.
        // 현재는 생성 로직에 집중합니다.
        // await reviewAPI.update(formData);
        throw new Error(
          "Review update is not yet implemented in useReview hook."
        );
      }

      const orderId = Number(formData.get("orderId"));

      // 2) 즉시 UI 반영: Zustand store에서 해당 주문을 reviewed:true 로 변경
      //    -> OrderList의 data(storeOrders)가 변경되어 즉시 리렌더링됨
      markReviewed(orderId);

      // 3) React Query 캐시도 안전하게 업데이트
      //    -> useReview 훅의 createReview onSuccess에서 이미 처리하고 있으므로 주석 처리
      //       (중복 로직 제거)

      // 4) 서버 최신화 (백그라운드)
      //    -> useReview 훅의 createReview onSuccess에서 이미 처리하고 있으므로 주석 처리
      //       (중복 로직 제거)

      alert("리뷰가 성공적으로 저장되었습니다.");

      // 모달 닫기 (성공 시에만)
      setReviewOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      // API 호출 실패 시 에러 처리
      handleError(err, "OrderInfo.handleReviewSubmit");
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <Card title="주문 정보">
      {!storeOrders || storeOrders.length === 0 ? (
        <EmptyState
          icon={<FaUtensils />}
          title="주문 내역이 없습니다."
          description="최근 주문하신 내역이 여기에 표시됩니다."
        />
      ) : (
        <>
          {/* OrderList는 기존대로, data만 store에서 주입 */}
          <OrderList
            data={storeOrders}
            type="user"
            onReviewClick={handleReviewClick}
            onStatusChange={updateStatus}
            refreshTrigger={page} // 외부 트리거(페이지) 전달
          />

          {pageInfo && (
            <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* 리뷰 작성 모달 */}
      {isReviewOpen && selectedOrder && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setReviewOpen(false)}
          mode="create"
          order={selectedOrder}
          onSubmit={handleReviewSubmit}
        />
      )}
    </Card>
  );
}
