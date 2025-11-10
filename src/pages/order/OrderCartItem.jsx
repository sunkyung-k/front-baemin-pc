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

  /** 옵션 가져오기 */
  const optionNames = options?.map((opt) => opt.menuOption?.menuOptName) || [];

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
          {optionNames.length > 0 && (
            <p className={styles.desc}>{optionNames.join(", ")}</p>
          )}
          <p className={styles.unitPrice}>{formatPrice(totalPrice)}원</p>
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
