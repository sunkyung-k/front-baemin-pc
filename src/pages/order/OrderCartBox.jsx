import React from "react";
import OrderCartItem from "./OrderCartItem";
import { FaTrashAlt } from "react-icons/fa";
import InputField from "@/components/form/InputField";
import { useBasketOrder } from "@/hooks/useBasketOrder";
import { useAddressStore } from "@/store/useAddressStore";
import styles from "./OrderCartBox.module.scss";
import stylesLayout from "./OrderLayout.module.scss";

/**
 * OrderCartBox
 * ------------------------------------------------------
 * - 결제 페이지 왼쪽 영역
 * - 장바구니 목록 + 배송 정보 + 전체삭제 기능
 * - Mutation 로직은 useBasketOrder 훅으로 통합
 */
export default function OrderCartBox({ basket, addrDetail, setAddrDetail }) {
  const { removeItem, clearAll } = useBasketOrder();
  const { address } = useAddressStore();

  /** 단일 항목 삭제 */
  const handleRemove = (basketItemId) => {
    if (!window.confirm("이 항목을 삭제하시겠습니까?")) return;
    removeItem(basketItemId);
  };

  /** 전체 삭제 */
  const handleClearAll = () => {
    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;
    clearAll();
  };

  return (
    <div className={stylesLayout.cartArea}>
      {/* 헤더 */}
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>결제하기</h2>
        <button
          type="button"
          className="btn btn-sm btn-secondary-line"
          disabled={clearAll.isPending}
          onClick={handleClearAll}
          aria-label="전체삭제"
        >
          <FaTrashAlt />
        </button>
      </div>

      {/* 장바구니 아이템 리스트 */}
      {basket.itemList.map((item) => (
        <OrderCartItem
          key={item.basketItemId}
          item={item}
          onRemove={handleRemove}
        />
      ))}

      {/* 배송정보 */}
      <div className={styles.formSection}>
        <h3>배송 정보</h3>

        {/* 메인주소는 전역값 그대로 표시, 수정 불가 */}
        <InputField
          label="주소"
          name="addr"
          type="text"
          value={address}
          readOnly
        />

        {/* 상세주소만 입력 가능 */}
        <InputField
          label="상세 주소"
          name="addrDetail"
          placeholder="예: 101동 505호"
          value={addrDetail}
          onChange={(e) => setAddrDetail(e.target.value)}
        />
      </div>
    </div>
  );
}
