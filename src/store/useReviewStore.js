import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useReviewStore (하이브리드 통합형)
 * -------------------------------------------------
 * - orders: 주문 목록 (리뷰 등록 시 버튼 숨김)
 * - reviews: 리뷰 목록 (리뷰 수정 시 즉시 반영)
 */
export const useReviewStore = create(
  devtools((set, get) => ({
    /** ✅ [주문 관련 상태] */
    orders: [],

    /** 서버에서 내려온 주문 리스트 */
    setOrders: (orderList = []) =>
      set(() => ({
        orders: Array.isArray(orderList) ? [...orderList] : [],
      })),

    /** 리뷰 완료된 주문을 불변성 유지하며 새 배열로 교체 */
    markReviewed: (orderId) =>
      set((state) => {
        const updated = state.orders.map((o) =>
          o.orderId === orderId ? { ...o, reviewed: true } : o
        );
        return { orders: [...updated] };
      }),

    clearOrders: () => set({ orders: [] }),

    /** ✅ [리뷰 관련 상태] */
    reviews: [],

    /** 리뷰 목록 교체 (React Query → store 동기화용) */
    setReviews: (reviewList = []) =>
      set(() => ({
        reviews: Array.isArray(reviewList) ? [...reviewList] : [],
      })),

    /** 단일 리뷰 수정 (수정 후 즉시 UI 반영) */
    updateReviewLocal: (updated) =>
      set((state) => {
        const newList = state.reviews.map((r) =>
          r.reviewId === updated.reviewId ? { ...r, ...updated } : r
        );
        return { reviews: [...newList] };
      }),

    clearReviews: () => set({ reviews: [] }),
  }))
);
