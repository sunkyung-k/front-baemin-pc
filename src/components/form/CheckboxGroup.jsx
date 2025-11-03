import React from "react";

/**
 * CheckboxGroup (공용 체크박스 그룹)
 * - RHF(register) 또는 수동 onChange 둘 다 호환
 * - label: string 또는 ReactNode 모두 지원
 * - values 배열 기반으로 다중 선택 관리
 */
export default function CheckboxGroup({
  label,
  name,
  options = [],
  register,
  values = [],
  onChange,
  errorMessage,
  direction = "column", // "row" | "column"
}) {
  const isRHF = typeof register === "function";
  const registerProps = isRHF ? register(name) : {};

  /** ✅ 특정 옵션 클릭 시 상태 업데이트 */
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
              onChange={isRHF ? undefined : () => handleToggle(opt.value)} // ✅ 각 체크박스 고유 핸들러
            />
            <span className="chk-label">
              {typeof opt.label === "string" ? opt.label : opt.label}
            </span>
          </label>
        ))}
      </div>

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
