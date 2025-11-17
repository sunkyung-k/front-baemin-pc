import React from "react";

export default function RadioGroup({
  label,
  name,
  options = [],
  register,
  value,
  onChange,
  errorMessage,
  direction = "row",
  disabled = false,
  isAdmin = false,
  removeOption,
}) {
  const isRHF = typeof register === "function";
  const registerProps = isRHF ? register(name) : {};

  return (
    <div className={`radio-group ${direction}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
        </label>
      )}

      <div className="radio-options">
        {options.map((opt) => (
          <label key={opt.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={opt.value}
              {...registerProps}
              checked={isRHF ? undefined : value === opt.value}
              onChange={isRHF ? undefined : onChange || (() => {})}
              disabled={disabled}
            />

            <span className="radio-label">
              {typeof opt.label === "string" ? opt.label : opt.label}
            </span>

            {/* 옵션 삭제 버튼 (어드민 전용) */}
            {isAdmin && removeOption && (
              <button
                className="btn btn-sm btn-danger admin-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption.mutate(Number(opt.value));
                }}
              >
                삭제
              </button>
            )}
          </label>
        ))}
      </div>

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
