import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useReviewStore (주문 + 리뷰 통합형)
 * -------------------------------------------------
 * - orders: 주문 내역 (리뷰 작성 후 버튼 숨김 처리)
 * - reviews: 리뷰 목록 (수정/삭제 시 UI 즉시 반영)
 */
export const useReviewStore = create(
  devtools((set, get) => ({
    /** 주문 관련 상태 */
    orders: [],

    /** 서버에서 내려온 주문 리스트 저장 */
    setOrders: (orderList = []) =>
      set(() => ({
        orders: Array.isArray(orderList) ? [...orderList] : [],
      })),

    /** 특정 주문의 reviewed 상태 true로 변경 */
    markReviewed: (orderId) =>
      set((state) => {
        const updatedOrders = state.orders.map((o) =>
          o.orderId === orderId ? { ...o, reviewed: true } : o
        );
        return { orders: [...updatedOrders] };
      }),

    /** 주문 초기화 */
    clearOrders: () => set({ orders: [] }),

    /** 리뷰 관련 상태 */
    reviews: [],

    /** 리뷰 목록 교체 */
    setReviews: (reviewList = []) =>
      set(() => ({
        reviews: Array.isArray(reviewList) ? [...reviewList] : [],
      })),

    /** 단일 리뷰 수정/삭제 (UI 즉시 반영) */
    updateReviewLocal: (updated) =>
      set((state) => {
        const newList = state.reviews.map((r) =>
          r.reviewId === updated.reviewId
            ? {
                ...r,
                ...updated,

                reply: updated.reply ? { ...updated.reply } : null,
              }
            : r
        );
        return { reviews: [...newList] };
      }),

    /** 단일 리뷰 삭제 */
    removeReviewLocal: (reviewId) =>
      set((state) => {
        const newList = state.reviews.filter((r) => r.reviewId !== reviewId);
        return { reviews: [...newList] };
      }),

    /** 리뷰 초기화 */
    clearReviews: () => set({ reviews: [] }),
  }))
);
