import { useState } from "react";
import styles from "./CartBox.module.scss";
import QuantityControl from "../../../../components/form/QuantityControl";

/**
 * CartBox
 * - 메뉴탭 우측 장바구니 UI
 * - 전역 QuantityControl 컴포넌트 사용
 * - 더미 데이터 기준 (수량 조절, 합계 계산)
 * - 이후 Zustand/React Query 연동 예정
 */
export default function CartBox() {
  const [items, setItems] = useState([
    { id: 1, name: "김치찌개", price: 8000, qty: 3 },
    { id: 2, name: "제육덮밥", price: 9000, qty: 2 },
  ]);

  /** ✅ 수량 변경 핸들러 */
  const handleQtyChange = (id, newQty) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: newQty } : it))
    );
  };

  /** ✅ 합계 계산 */
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return (
    <div className={styles.cartBox}>
      <h3 className={styles.title}>장바구니</h3>

      {/* ✅ 아이템 리스트 */}
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.id} className={styles.item}>
            <div className={styles.name}>{it.name}</div>

            {/* ✅ 공용 수량 컨트롤러 적용 */}
            <QuantityControl
              value={it.qty}
              min={1}
              max={10}
              size="md"
              onChange={(newQty) => handleQtyChange(it.id, newQty)}
            />

            <div className={styles.price}>
              ₩{(it.price * it.qty).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ 총합 */}
      <div className={styles.total}>
        <p className={styles.label}>총 합계:</p>
        <p className={styles.amount}>₩{total.toLocaleString()}</p>
      </div>

      <button className={styles.orderBtn}>주문하기 →</button>
    </div>
  );
}
