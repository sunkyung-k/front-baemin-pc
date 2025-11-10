import React from "react";
import { formatPrice } from "@/utills/valueFormatter";
import QuantityControl from "@/components/form/QuantityControl";
import { FaTimes } from "react-icons/fa";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import useBasket from "@/hooks/useBasket";
import styles from "./OrderCartItem.module.scss";

export default function OrderCartItem({ item, onRemove }) {
  const { basketItemId, menu, quantity, totalPrice } = item;
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
          <p className={styles.desc}>{menu?.description}</p>
          <p className={styles.unitPrice}>₩{menu?.price?.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.right}>
        <QuantityControl
          value={quantity}
          min={1}
          max={99}
          onChange={handleQtyChange}
          size="md"
        />

        <div className={styles.price}>₩{formatPrice(totalPrice)}</div>

        <button
          className={styles.removeBtn}
          onClick={handleRemoveClick}
          title="삭제"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
