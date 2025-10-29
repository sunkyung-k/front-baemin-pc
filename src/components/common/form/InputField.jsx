// src/components/common/form/InputField.jsx
import React from "react";

/**
 * 전역 공용 InputField
 * RHF, 수동 상태, 더미(dummyRegister) 모두 커버
 */
export default function InputField({
  label,
  type = "text",
  name,
  placeholder,
  errorMessage,
  register, // RHF or dummyRegister
  value,
  onChange,
  onFocus,
  autoComplete = "off",
  disabled = false,
}) {
  let inputProps = {};

  // register가 있고 RHF에서 온 함수라면
  if (typeof register === "function") {
    const temp = register(name);

    // RHF register인지 판별 (ref 속성이 있고, onBlur 있음)
    const isRHFRegister =
      temp && (typeof temp.onBlur === "function" || temp.ref !== undefined);

    if (isRHFRegister) {
      inputProps = { ...temp }; // RHF인 경우 그대로 사용
    } else {
      inputProps = {}; // 더미(dummyRegister)는 무시하고 일반 value/onChange 사용
    }
  }

  // 수동제어 모드 (value, onChange가 명시적으로 존재하면 우선 적용)
  if (onChange) inputProps.onChange = onChange;
  if (value !== undefined) inputProps.value = value;

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
        {...inputProps}
        onFocus={onFocus}
      />
      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
