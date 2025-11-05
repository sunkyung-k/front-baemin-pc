import React from "react";
import {
  formatPhone,
  formatPrice,
  formatBusinessNo,
  formatBirth,
} from "@/utills/valueFormatter"; // 공통 포맷 유틸 불러오기

/**
 * 전역 공용 InputField
 * ------------------------------------------------------------
 * RHF register / 수동 제어 모두 지원
 * type에 따른 자동 포맷 지원:
 *    - "phone"    → 전화번호 하이픈 자동 추가 (010-1234-5678)
 *    - "price"    → 금액 3자리 콤마 자동 추가 (10,000)
 *    - "number"   → 숫자만 허용 (음수 입력 방지)
 *    - "business" → 사업자등록번호 자동 하이픈 (000-00-00000)
 *    - "birth"    → 생년월일 자동 하이픈 (1993-08-10)
 * Yup 등 상위 검증 스키마와 완벽 호환
 * ------------------------------------------------------------
 */
export default function InputField({
  label,
  type = "text",
  name,
  placeholder,
  errorMessage,
  register,
  value,
  onChange,
  onFocus,
  autoComplete = "off",
  disabled = false,
}) {
  // RHF register 지원
  const registered = typeof register === "function" ? register(name) : {};

  /** 입력 핸들러 */
  const handleChange = (e) => {
    let val = e.target.value || "";

    // 입력 타입별 포맷 처리
    if (type === "phone") val = formatPhone(val);
    else if (type === "business") val = formatBusinessNo(val);
    else if (type === "price") val = formatPrice(val);
    else if (type === "birth") val = formatBirth(val);
    else if (type === "number") val = val.replace(/[^0-9]/g, "");

    e.target.value = val;

    // RHF register 연결
    if (registered?.onChange) {
      registered.onChange({ target: { name, value: val } });
    }

    // 수동 제어 onChange
    onChange?.(e);
  };

  /** 음수 입력 방지 */
  const handleKeyDown = (e) => {
    if (type === "number" && e.key === "-") e.preventDefault();
  };

  /** input type 실제 적용 (포맷이 필요한 타입은 text로) */
  const resolvedType =
    type === "phone" ||
    type === "price" ||
    type === "business" ||
    type === "birth"
      ? "text"
      : type;

  return (
    <div className="input-field">
      {label && <label htmlFor={name}>{label}</label>}

      <input
        id={name}
        name={name}
        type={resolvedType}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`input-txt ${errorMessage ? "error" : ""}`}
        {...registered}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        inputMode={
          type === "price" ||
          type === "phone" ||
          type === "business" ||
          type === "birth"
            ? "numeric"
            : undefined
        }
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
