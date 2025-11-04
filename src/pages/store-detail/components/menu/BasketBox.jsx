import { useState } from "react";
import styles from "./BasketBox.module.scss";
import { FaTrashAlt } from "react-icons/fa";
import useBasket from "@/hooks/useBasket";
import BasketItem from "./BasketItem";
import LoadingSpinner from "../../../../components/LoadingSpinner";

/**
 * BasketBox
 * ------------------------------------------------------
 * - USER 전용 장바구니 UI
 * - useBasket 훅과 React Query로 상태 동기화
 */
export default function BasketBox() {
  const { basketQuery, increase, decrease, removeItem, clearAll, orderAll } =
    useBasket();
  const basket = basketQuery?.data;
  const isEmpty = !basket || !basket.itemList || basket.itemList.length === 0;
  const [isOpen, setIsOpen] = useState(false);

  if (basketQuery?.isLoading) return "";
  // if (basketQuery?.isError) return <p>장바구니를 불러오지 못했습니다.</p>;

  /** 장바구니 전체 비우기 */
  const handleClear = () => {
    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;
    clearAll.mutate();
  };

  /** 전체 주문 처리 */
  const handleOrder = () => {
    if (!window.confirm("주문을 진행하시겠습니까?")) return;
    orderAll.mutate({
      addr: "서울특별시 은평구",
      addrDetail: "은평경찰서 2층",
    });
  };

  return (
    <>
      {/* 장바구니 열림 시 배경 딤처리 */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`${styles.basketBox} ${
          isOpen ? styles.open : styles.closed
        }`}
      >
        {/* 헤더(타이틀 + 전체삭제 버튼) */}
        <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
          <h3 className={styles.title}>장바구니</h3>
          {!isEmpty && (
            <button
              type="button"
              className="btn btn-sm btn-secondary-line"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label="전체삭제"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>

        {/* 장바구니 항목 목록 */}
        <div className={styles.content}>
          <ul className={styles.list}>
            {!isEmpty ? (
              basket.itemList.map((it) => (
                <BasketItem
                  key={it.basketItemId}
                  item={it}
                  onIncrease={() => increase.mutate(it.basketItemId)}
                  onDecrease={() => decrease.mutate(it.basketItemId)}
                  onRemove={() => removeItem.mutate(it.basketItemId)}
                />
              ))
            ) : (
              <li className={styles.empty}>장바구니가 비어 있습니다.</li>
            )}
          </ul>
        </div>

        {/* 주문 버튼 */}
        <button
          className="btn btn-default btn-primary"
          onClick={!isEmpty ? handleOrder : undefined}
          disabled={isEmpty}
        >
          주문하기 →
        </button>
      </div>
    </>
  );
}
