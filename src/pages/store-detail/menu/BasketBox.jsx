import { useState, useEffect } from "react";
import styles from "./BasketBox.module.scss";
import { FaTrashAlt } from "react-icons/fa";
import useBasket from "@/hooks/useBasket";
import { useBasketStore } from "@/store/useBasketStore";
import BasketItem from "./BasketItem";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utills/valueFormatter";
import { authStore } from "@/store/authStore";

/**
 * BasketBox
 * ------------------------------------------------------
 */
export default function BasketBox() {
  // 1. 모든 Hooks 호출은 최상단에 위치합니다.
  const { currentStoreId } = useBasketStore(); // Zustand 전역 storeId 참조
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // authStore에서 직접 userRole을 가져와 조건부 렌더링을 빠르게 결정합니다.
  // **주의: Header.jsx와 달리 이곳은 리액티브하지 않을 수 있지만, 초기 마운트 시 빠르게 GUEST를 차단합니다.**
  // useBasket 훅 내부에서 isUserAllowed를 사용하므로, 여기서는 UI 차단용으로만 사용합니다.
  const { userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");

  const {
    basketQuery = {},
    increase = {},
    decrease = {},
    removeItem = {},
    clearAll = { reset: () => {} },
  } = useBasket();

  // 2. Hooks 호출이 끝난 후 데이터를 추출합니다.
  const basket = basketQuery?.data;
  const isEmpty = !basket || !basket.itemList || basket.itemList.length === 0;

  // 3. useEffect 훅은 Hooks 다음에 위치합니다. (불필요한 `isUser` 체크 제거)
  useEffect(() => {
    // isUser는 훅 밖에서 가져왔고, isEmpty는 훅 결과에서 계산되었으므로,
    // 의존성 배열에 모두 포함되어야 합니다.
    if (isEmpty && currentStoreId !== null) {
      const resetFn = clearAll.reset;
      resetFn?.();
    }
  }, [isEmpty, currentStoreId, clearAll]);

  // 4. 조건부 return은 Hooks 호출 후에 위치시킵니다.
  if (!isUser) return null;

  // --- 이후 일반 함수 및 UI 로직 ---

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
