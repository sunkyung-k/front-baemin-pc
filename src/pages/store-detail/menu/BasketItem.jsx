import QuantityControl from "@/components/form/QuantityControl";
import { FaTimes } from "react-icons/fa";
import styles from "./BasketItem.module.scss";

export default function BasketItem({ item, onIncrease, onDecrease, onRemove }) {
  const { menu, quantity, totalPrice, options } = item;
  const isSoldOut = menu?.soldoutYn === "Y" || menu?.delYn === "Y";

  // 옵션 이름 + 추가금 표시
  const optionLabels =
    options?.length > 0
      ? options
          .map((o) => {
            const name = o.menuOption.menuOptName;
            const totalOptPrice = o.totalPrice || 0;
            return totalOptPrice > 0
              ? `${name} (+${totalOptPrice.toLocaleString()}원)`
              : name;
          })
          .join(", ")
      : "";

  // 수량 변경 핸들러
  const handleQtyChange = (newQty) => {
    if (isSoldOut) return; // 품절 시 수량 변경 불가
    const diff = Number(newQty) - Number(quantity || 0);
    if (diff === 0) return;
    if (diff > 0) for (let i = 0; i < diff; i++) onIncrease();
    else for (let i = 0; i < Math.abs(diff); i++) onDecrease();
  };

  return (
    <li className={`${styles.item} ${isSoldOut ? styles.soldout : ""}`}>
      <div className={styles.header}>
        <div className={styles.name}>
          {menu?.menuName}

          {optionLabels && (
            <span className={styles.options}>{optionLabels}</span>
          )}
        </div>
        {isSoldOut && <span className={styles.soldoutBadge}>품절</span>}
        <button
          type="button"
          className="btn btn-sm btn-secondary-line"
          onClick={onRemove}
          aria-label="삭제"
        >
          <FaTimes />
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.controls}>
          <QuantityControl
            value={quantity}
            min={1}
            max={99}
            size="md"
            onChange={handleQtyChange}
            disabled={isSoldOut}
          />
        </div>
        <div className={styles.price}>
          {(totalPrice || 0).toLocaleString()}원
        </div>
      </div>
    </li>
  );
}
