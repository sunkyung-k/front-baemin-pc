import React from "react";
import { formatPrice } from "@/utills/valueFormatter";
import QuantityControl from "@/components/form/QuantityControl";
import { MdClose } from "react-icons/md";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import useBasket from "@/hooks/useBasket";
import styles from "./OrderCartItem.module.scss";

export default function OrderCartItem({ item, onRemove }) {
  const { basketItemId, menu, quantity, totalPrice, options } = item;
  const imageUrl = getAbsoluteImageUrl(menu);
  const { increase, decrease } = useBasket();

  /** 수량 변경 */
  const handleQtyChange = (newQty) => {
    const diff = newQty - quantity;
    if (diff > 0) {
      increase.mutate(basketItemId);
    } else if (diff < 0) {
      decrease.mutate(basketItemId);
    }
  };

  /** 삭제 */
  const handleRemoveClick = () => {
    onRemove?.(basketItemId);
  };

  const optionLabels =
    options?.length > 0
      ? options
          .map((opt) => {
            const name = opt.menuOption?.menuOptName ?? "";
            const optPrice = opt.menuOption?.price ?? 0;
            return optPrice > 0
              ? `${name} (+${formatPrice(optPrice)}원)`
              : name;
          })
          .join(", ")
      : "";

  return (
    <div className={styles.cartItem}>
      <div className={styles.left}>
        <div className={styles.thumb}>
          {imageUrl ? (
            <img src={imageUrl} alt={menu.menuName} />
          ) : (
            <div className={styles.noImg}></div>
          )}
        </div>

        <div className={styles.cartInfo}>
          <p className={styles.name}>{menu?.menuName}</p>

          {/* {optionLabels && <p className={styles.desc}>{optionLabels}</p>} */}

          <p className={styles.unitPrice}>{optionLabels}</p>
        </div>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.btnRemove}
          onClick={handleRemoveClick}
          aria-label="삭제"
        >
          <MdClose />
        </button>

        <QuantityControl
          value={quantity}
          min={1}
          max={99}
          onChange={handleQtyChange}
          size="md"
        />

        <div className={styles.price}>{formatPrice(totalPrice)}원</div>
      </div>
    </div>
  );
}
