import React from "react";

export default function CheckboxGroup({
  label,
  name,
  options = [],
  register,
  values = [],
  onChange,
  errorMessage,
  direction = "column",
  isAdmin = false,
  removeOption, // removeOption.mutate(optId)
}) {
  const isRHF = typeof register === "function";
  const registerProps = isRHF ? register(name) : {};

  const handleToggle = (value) => {
    let updated = [...values];
    if (updated.includes(value)) {
      updated = updated.filter((v) => v !== value);
    } else {
      updated.push(value);
    }
    onChange?.(updated);
  };

  return (
    <div className={`chk-group ${direction}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
        </label>
      )}

      <div className="chk-options">
        {options.map((opt) => (
          <label key={opt.value} className="chk-option">
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              {...registerProps}
              checked={isRHF ? undefined : values.includes(opt.value)}
              onChange={isRHF ? undefined : () => handleToggle(opt.value)}
            />

            <span className="chk-label">
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
