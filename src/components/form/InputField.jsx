import React from "react";
import { formatPhone, formatPrice } from "@/utills/valueFormatter"; // 공통 포맷 유틸 불러오기

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

  /** 유틸 함수 사용으로 간결화 */
  const handleChange = (e) => {
    let val = e.target.value || "";
    if (type === "phone") val = formatPhone(val);
    else if (type === "price") val = formatPrice(val);
    else if (type === "number") val = val.replace(/[^0-9]/g, "");

    e.target.value = val;

    if (registered?.onChange) {
      registered.onChange({ target: { name, value: val } });
    }

    onChange?.(e);
  };

  const handleKeyDown = (e) => {
    if (type === "number" && e.key === "-") e.preventDefault();
  };

  const resolvedType = type === "phone" || type === "price" ? "text" : type;

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
        inputMode={type === "price" || type === "phone" ? "numeric" : undefined}
      />
      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
