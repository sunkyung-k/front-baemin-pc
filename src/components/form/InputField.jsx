import React from "react";

/**
 * 🌐 전역 공용 InputField
 * - RHF register / 수동 제어 모두 지원
 * - type="phone" → 전화번호 자동 하이픈
 * - type="price" → 3자리 콤마 자동 추가
 * - type="number" → 음수 입력 방지
 * - Yup 등 상위 스키마와 완벽 호환
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
  const registered = typeof register === "function" ? register(name) : {};

  /** 전화번호 포맷 */
  const formatPhone = (val = "") => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";

    if (digits.startsWith("02")) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9)
        return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(
        6,
        10
      )}`;
    }

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 11)
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  /** 금액 포맷 */
  const formatPrice = (val = "") => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /** 입력 처리 */
  const handleChange = (e) => {
    let val = e.target.value || "";

    // type별 포맷팅 처리
    if (type === "phone") val = formatPhone(val);
    else if (type === "price") val = formatPrice(val);
    else if (type === "number") val = val.replace(/[^0-9]/g, ""); // 음수 방지

    e.target.value = val;

    // RHF 연결
    if (registered?.onChange) {
      registered.onChange({
        target: { name, value: val },
      });
    }

    onChange?.(e);
  };

  /** '-' 입력 방지 (number일 때) */
  const handleKeyDown = (e) => {
    if (type === "number" && e.key === "-") e.preventDefault();
  };

  /** 실제 input type 결정 */
  const resolvedType = type === "phone" || type === "price" ? "text" : type;

  return (
    <div className="input-field">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}

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
        inputMode={type === "price" || type === "phone" ? "numeric" : undefined}
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
