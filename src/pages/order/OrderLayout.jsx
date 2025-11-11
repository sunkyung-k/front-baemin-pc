import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa6";
import basketAPI from "@/service/basketAPI";
import { useAddressStore } from "@/store/useAddressStore";
import useAccount from "@/hooks/useAccount";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useBasketStore } from "@/store/useBasketStore"; // 추가
import OrderCartBox from "./OrderCartBox";
import OrderSummaryBox from "./OrderSummaryBox";
import EmptyState from "@/components/menu/EmptyState";
import styles from "./OrderLayout.module.scss";

export default function OrderLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // React Query 캐시 제어
  const { clearBasket } = useBasketStore(); // Zustand 상태 초기화 훅
  const { address } = useAddressStore();
  const { userInfo } = useAccount();
  const handleError = useHandleError();

  const myDeposit = userInfo?.deposit ?? 0;
  const [addr, setAddr] = useState(address || "");
  const [addrDetail, setAddrDetail] = useState("");

  /** 전역 주소 상태 → 로컬 상태로 동기화 */
  useEffect(() => {
    if (address) setAddr(address);
  }, [address]);

  /** 장바구니 데이터 조회 */
  const { data: basket } = useQuery({
    queryKey: ["basket"],
    queryFn: basketAPI.getMyBasket,
    onError: (err) => handleError(err, "OrderLayout.getBasket"),
  });

  /** 주문 처리 */
  const orderMutation = useMutation({
    mutationFn: basketAPI.orderAll,
    onSuccess: async () => {
      // 장바구니 비우기 (Zustand + React Query 캐시 동기화)
      clearBasket(); // Zustand 상태 비움
      await queryClient.invalidateQueries(["basket"]); // 서버 캐시 무효화

      alert("결제가 완료되었습니다.");
      navigate("/order/complete", {
        state: { fromOrder: true, orderDate: new Date().toISOString() },
      });
    },
    onError: (err) => handleError(err, "OrderLayout.orderAll"),
  });

  // 데이터 없을 때 렌더 차단
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

  /** 최소 주문 금액 */
  const minPrice = basket?.store?.minPrice ?? basket?.minPrice ?? 0;

  /** 결제 실행 */
  const handleOrder = () => {
    const trimmedAddr = addr?.trim();
    const trimmedAddrDetail = addrDetail?.trim();

    // 주소 입력 체크
    if (!trimmedAddr) {
      alert("주소를 입력해주세요!");
      return;
    }

    // 최소 주문 금액 확인
    if (minPrice > 0 && finalTotal < minPrice) {
      alert(
        `최소 주문 금액은 ${minPrice.toLocaleString()}원 이상이어야 합니다.`
      );
      return;
    }

    // 보유금 체크
    if (isLackPoint) {
      alert("보유금이 부족합니다. 충전 후 다시 시도해주세요.");
      return;
    }

    // 결제 확인창
    if (!window.confirm("결제를 진행하시겠습니까?")) return;

    // 실제 결제 요청
    const payload = {
      addr: trimmedAddr,
      addrDetail: trimmedAddrDetail || "",
    };

    orderMutation.mutate(payload);
  };

  return (
    <div className={styles.orderWrap}>
      <section className={styles.leftArea}>
        <OrderCartBox
          basket={basket}
          addr={addr}
          setAddr={setAddr}
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
