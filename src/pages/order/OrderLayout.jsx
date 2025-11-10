import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa6";
import basketAPI from "@/service/basketAPI";
import { useAddressStore } from "@/store/useAddressStore";
import useAccount from "@/hooks/useAccount";
import { useHandleError } from "@/hooks/common/useHandleError";
import OrderCartBox from "./OrderCartBox";
import OrderSummaryBox from "./OrderSummaryBox";
import EmptyState from "@/components/menu/EmptyState";
import styles from "./OrderLayout.module.scss";

export default function OrderLayout() {
  const navigate = useNavigate();
  const { address } = useAddressStore(); // 전역 주소 상태
  const { userInfo } = useAccount(); // 내 정보 (보유금)
  const handleError = useHandleError(); // 공통 에러 핸들러

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
    onSuccess: () => {
      alert("결제가 완료되었습니다.");
      navigate("/order/complete", {
        state: { fromOrder: true, orderDate: new Date().toISOString() },
      });
    },
    onError: (err) => handleError(err, "OrderLayout.orderAll"),
  });

  // 데이터 없을 때는 렌더 차단
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
    const trimmedAddr = addr?.trim();
    const trimmedAddrDetail = addrDetail?.trim();

    if (!trimmedAddr) {
      alert("주소를 입력해주세요!");
      return;
    }

    // 결제 전 확인창
    if (!window.confirm("결제를 진행하시겠습니까?")) return;

    const payload = {
      addr: trimmedAddr,
      addrDetail: trimmedAddrDetail || "",
    };

    // 결제 요청 (onSuccess는 useMutation에서 처리)
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
