import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa6";
import basketAPI from "@/service/basketAPI";
import { useAddressStore } from "@/store/useAddressStore";
import useAccount from "@/hooks/useAccount";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useBasketStore } from "@/store/useBasketStore";
import OrderCartBox from "./OrderCartBox";
import OrderSummaryBox from "./OrderSummaryBox";
import EmptyState from "@/components/menu/EmptyState";
import styles from "./OrderLayout.module.scss";
import { authStore } from "@/store/authStore";

export default function OrderLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // React Query 캐시 제어
  const { clearBasket } = useBasketStore(); // Zustand 상태 초기화 훅
  const { address } = useAddressStore();
  const { userInfo } = useAccount();
  const handleError = useHandleError();

  const myDeposit = userInfo?.deposit ?? 0;
  const [addrDetail, setAddrDetail] = useState("");

  const { userRole, token } = authStore.getState();
  const isUser = userRole?.includes("USER");
  const isUserAuthenticated = isUser && !!token; // 토큰이 있을 때만 쿼리 실행

  /** 장바구니 데이터 조회 — USER만 호출 */
  const { data: basket } = useQuery({
    queryKey: ["basket"],
    queryFn: basketAPI.getMyBasket,
    // enabled 조건 강화: isUserAuthenticated (인증 로딩 완료 시점까지 대기)
    enabled: isUserAuthenticated,
    onError: (err) => handleError(err, "OrderLayout.getBasket"),
  });

  /** 주문 처리 */
  const orderMutation = useMutation({
    mutationFn: basketAPI.orderAll,
    onSuccess: async (response, payload) => {
      // GA전송
      if (window.gtag) {
        const itemCount = basket?.itemList?.reduce(
          (acc, cur) => acc + (cur.quantity ?? 1),
          0
        );

        window.gtag("event", "order_complete", {
          orderId: response?.orderId ?? null,
          storeId: basket?.storeId ?? null,
          price: basket?.totalPrice ?? 0,
          itemCount,
          timestamp: Date.now(),
        });
      }

      // GA 전송 안정화를 위해 120~200ms 정도 대기 권장
      setTimeout(async () => {
        clearBasket(); // 로컬 장바구니 비움
        await queryClient.invalidateQueries(["basket"]); // 서버 캐시 최신화

        alert("결제가 완료되었습니다.");

        navigate("/order/complete", {
          state: { fromOrder: true, orderDate: new Date().toISOString() },
        });
      }, 150);
    },
    onError: (err) => handleError(err, "OrderLayout.orderAll"),
  });

  // 데이터 없을 때 렌더 차단 (isUserAuthenticated가 false일 때도 null 반환)
  if (!basket) return null;
  const isEmpty = !basket.itemList || basket.itemList.length === 0;
  if (isEmpty)
    return (
      <EmptyState
        icon={<FaBoxOpen />}
        title="장바구니가 비어 있습니다."
        description="맛있는 메뉴를 담고 결제를 진행해보세요!"
      />
    );

  /** 계산 */
  const productTotal = basket.totalPrice ?? 0;
  const finalTotal = productTotal;
  const isLackPoint = finalTotal > myDeposit;

  /** 결제 실행 */
  const handleOrder = () => {
    // 보유금 체크
    if (isLackPoint) {
      alert("보유금이 부족합니다. 충전 후 다시 시도해주세요.");
      return;
    }

    // 결제 확인창
    if (!window.confirm("결제를 진행하시겠습니까?")) return;

    // 실제 결제 요청
    const payload = {
      addr: address,
      addrDetail: addrDetail.trim(),
    };

    orderMutation.mutate(payload);
  };

  return (
    <div className={styles.orderWrap}>
      <section className={styles.leftArea}>
        <OrderCartBox
          basket={basket}
          addrDetail={addrDetail}
          setAddrDetail={setAddrDetail}
        />
      </section>

      <aside className={styles.rightArea}>
        <OrderSummaryBox
          productTotal={productTotal}
          finalTotal={finalTotal}
          myDeposit={myDeposit}
          isLackPoint={isLackPoint}
          handleOrder={handleOrder}
          orderPending={orderMutation.isPending}
        />
      </aside>
    </div>
  );
}
