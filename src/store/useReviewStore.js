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
    /** 리뷰 목록 */
    reviews: [],

    /** 리뷰 목록 저장 */
    setReviews: (reviewList = []) =>
      set(() => ({
        reviews: Array.isArray(reviewList) ? [...reviewList] : [],
      })),

    /** 리뷰 수정/삭제 → UI 즉시 반영 */
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

    /** 리뷰 삭제 */
    removeReviewLocal: (reviewId) =>
      set((state) => ({
        reviews: state.reviews.filter((r) => r.reviewId !== reviewId),
      })),

    /** 전체 초기화 */
    clearReviews: () => set({ reviews: [] }),
  }))
);
