// src/components/form/InputField.jsx
import React from "react";

/**
 * 전역 공용 InputField
 * - RHF register / 수동 제어 모두 지원
 * - 검증 및 min/max 제한은 Yup 등 상위 레벨에서 처리
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
  // RHF register 감지
  const registered = typeof register === "function" ? register(name) : {};

  // '-' 키 입력 차단 (숫자 타입일 때만)
  const handleKeyDown = (e) => {
    if (type === "number" && e.key === "-") e.preventDefault();
  };

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
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`input-txt ${errorMessage ? "error" : ""}`}
        {...registered}
        value={value}
        onChange={onChange || registered?.onChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
