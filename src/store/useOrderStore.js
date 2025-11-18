import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * useOrderStore (주문 전용 Zustand)
 * -------------------------------------------------
 * - orders: 주문 내역
 * - setOrders: 서버에서 받은 주문 리스트 저장
 * - markReviewed: 특정 주문을 리뷰 완료 처리
 * - clearOrders: 유저 변경/로그아웃 시 전체 초기화
 */
export const useOrderStore = create(
  devtools((set, get) => ({
    /** 주문 리스트 */
    orders: [],

    /** 주문 리스트 저장 */
    setOrders: (orderList = []) =>
      set(() => ({
        orders: Array.isArray(orderList) ? [...orderList] : [],
      })),

    /** 리뷰 완료 처리 → UI 즉시 반영 */
    markReviewed: (orderId) =>
      set((state) => {
        const updated = state.orders.map((o) =>
          o.orderId === orderId ? { ...o, reviewed: true } : o
        );
        return { orders: updated };
      }),

    /** 주문 초기화 (로그아웃/계정 변경 시) */
    clearOrders: () => set({ orders: [] }),
  }))
);
