import { useState, useEffect } from "react";
import styles from "./BasketBox.module.scss";
import { FaTrashAlt } from "react-icons/fa";
import useBasket from "@/hooks/useBasket";
import { useBasketStore } from "@/store/useBasketStore"; // 추가
import BasketItem from "./BasketItem";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utills/valueFormatter";

/**
 * BasketBox
 * ------------------------------------------------------
 * - USER 전용 장바구니
 * - clearAll / orderAll confirm 1회만 표시
 */
export default function BasketBox() {
  const { basketQuery, increase, decrease, removeItem, clearAll } = useBasket();
  const { currentStoreId } = useBasketStore(); // Zustand 전역 storeId 참조
  const basket = basketQuery?.data;
  const isEmpty = !basket || !basket.itemList || basket.itemList.length === 0;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  /** 장바구니 비워지면 storeId도 null로 확인 (confirm 방지용) */
  useEffect(() => {
    if (isEmpty && currentStoreId !== null) {
      // storeId가 남아있으면 수동 초기화 방어
      clearAll.reset?.(); // react-query mutation 상태 초기화 (선택)
    }
  }, [isEmpty, currentStoreId]);

  const handleClear = () => {
    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;
    clearAll.mutate();
  };

  const handleOrder = () => {
    if (!window.confirm("주문을 진행하시겠습니까?")) return;
    navigate("/order");
  };

  /** 총합계 계산 */
  const totalPrice = !isEmpty
    ? basket.itemList.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0)
    : 0;

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`${styles.basketBox} ${
          isOpen ? styles.open : styles.closed
        }`}
      >
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
              전체 삭제
            </button>
          )}
        </div>

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

        {!isEmpty && (
          <div>
            <div className={styles.totalBox}>
              <span className={styles.totalLabel}>총 합계</span>
              <strong className={styles.totalPrice}>
                {formatPrice(totalPrice)}원
              </strong>
            </div>
          </div>
        )}

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
