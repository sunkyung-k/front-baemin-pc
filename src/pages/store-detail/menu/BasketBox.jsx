import { useState } from "react";
import styles from "./BasketBox.module.scss";
import { FaTrashAlt } from "react-icons/fa";
import useBasket from "@/hooks/useBasket";
import BasketItem from "./BasketItem";
import { useNavigate } from "react-router-dom";

/**
 * BasketBox
 * ------------------------------------------------------
 * - USER 전용 장바구니
 * - clearAll / orderAll confirm 1회만 표시
 */
export default function BasketBox() {
  const { basketQuery, increase, decrease, removeItem, clearAll, orderAll } =
    useBasket();
  const basket = basketQuery?.data;
  const isEmpty = !basket || !basket.itemList || basket.itemList.length === 0;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleClear = () => {
    if (!window.confirm("장바구니를 모두 비우시겠습니까?")) return;
    clearAll.mutate();
  };

  const handleOrder = () => {
    if (!window.confirm("주문을 진행하시겠습니까?")) return;
    navigate("/order");
  };

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
              <FaTrashAlt />
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
