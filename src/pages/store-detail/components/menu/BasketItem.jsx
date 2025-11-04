import QuantityControl from "@/components/form/QuantityControl";
import { FaTimes } from "react-icons/fa";
import styles from "./BasketItem.module.scss";

/**
 * BasketItem
 * - 서버 totalPrice 그대로 사용 (프론트 계산 제거)
 * - 옵션 가격 0원은 숨김
 * - 수량 변경 시 서버 increase/decrease 호출
 */
export default function BasketItem({ item, onIncrease, onDecrease, onRemove }) {
  const { menu, quantity, totalPrice, options } = item;

  // 옵션 이름 + 개별 추가금 표시 (0원 제외)
  const optionLabels =
    options && options.length > 0
      ? options
          .map((o) => {
            const name = o.menuOption.menuOptName;
            const totalOptPrice = o.totalPrice || 0; // 서버에서 계산된 옵션별 총합
            return totalOptPrice > 0
              ? `${name} (+₩${totalOptPrice.toLocaleString()})`
              : name;
          })
          .join(", ")
      : "";

  /** 수량 변경 핸들러 */
  const handleQtyChange = (newQty) => {
    const diff = Number(newQty) - Number(quantity || 0);
    if (diff === 0) return;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) onIncrease();
    } else {
      for (let i = 0; i < Math.abs(diff); i++) onDecrease();
    }
  };

  return (
    <li className={styles.item}>
      {/* 상단: 메뉴명 + 옵션 + 삭제버튼 */}
      <div className={styles.header}>
        <div className={styles.name}>
          {menu?.menuName}
          {optionLabels && <span>{optionLabels}</span>}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-secondary-line"
          onClick={onRemove}
          aria-label="삭제"
        >
          <FaTimes />
        </button>
      </div>

      {/* 하단: 수량조절 + 가격 */}
      <div className={styles.info}>
        <div className={styles.controls}>
          <QuantityControl
            value={quantity}
            min={1}
            max={99}
            size="md"
            onChange={handleQtyChange}
          />
        </div>

        <div className={styles.price}>
          ₩{(totalPrice || 0).toLocaleString()}
        </div>
      </div>
    </li>
  );
}
