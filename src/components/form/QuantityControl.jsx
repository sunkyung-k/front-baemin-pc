import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
/**
 * QuantityControl (공용 수량 컨트롤)
 * --------------------------------------------
 * - 전역 SCSS 기반 (utils, fn-color 등 직접 적용)
 * - 어디서든 import 후 바로 사용 가능
 * - props:
 *    value (현재 수량)
 *    onChange(newValue)
 *    min, max (기본값: 1 ~ 99)
 *    size: "sm" | "md" | "lg"
 */

export default function QuantityControl({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = "md",
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
        <FaMinus size={10} />
      </button>
      <span className="qty-value">{value}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={handlePlus}
        disabled={value >= max}
      >
        <FaPlus size={10} />
      </button>
    </div>
  );
}
