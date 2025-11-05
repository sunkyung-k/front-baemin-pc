import React from "react";

/**
 * SelectBox (공용 셀렉트박스)
 * - RHF(register) 또는 수동 제어 호환
 * - 옵션: [{ label, value }]
 */
export default function SelectBox({
  label,
  name,
  options = [],
  register,
  value,
  onChange,
  errorMessage,
  disabled = false,
}) {
  const isRHF = typeof register === "function";
  const registerProps = isRHF ? register(name) : {};

  return (
    <div className="input-field select-field">
      {label && <label className="input-label">{label}</label>}

      <select
        name={name}
        {...registerProps}
        value={isRHF ? undefined : value}
        onChange={onChange}
        disabled={disabled}
        className={`input-txt ${errorMessage ? "error" : ""}`}
      >
        <option value="">선택해주세요</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
