import React from "react";

/**
 * QuantityControl (공용 수량 컨트롤)
 * - 어디서든 재사용 가능 (전역 SCSS 기반)
 * - value, onChange, min, max props 지원
 *
 * 예시:
 * <QuantityControl value={qty} onChange={setQty} size="md" />
 */
export default function QuantityControl({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = "md", // sm | md | lg
}) {
  const handleMinus = () => {
    if (value > min) onChange?.(value - 1);
  };

  const handlePlus = () => {
    if (value < max) onChange?.(value + 1);
  };

  return (
    <div className={`qty-control ${size}`}>
      <button
        type="button"
        className="qty-btn"
        onClick={handleMinus}
        disabled={value <= min}
      >
        -
      </button>

      <span className="qty-value">{value}</span>

      <button
        type="button"
        className="qty-btn"
        onClick={handlePlus}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
