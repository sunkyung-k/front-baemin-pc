import React from "react";

/**
 * RadioGroup (공용 라디오 그룹)
 * - RHF(register) 또는 수동 onChange 둘 다 호환
 * - 동일 name을 가진 여러 옵션을 묶어서 사용
 * - 라벨/정렬/에러메시지 포함
 *
 * 예시:
 * <RadioGroup
 *   label="품절 여부"
 *   name="soldOutYn"
 *   options={[
 *     { label: "판매중", value: "N" },
 *     { label: "품절", value: "Y" },
 *   ]}
 *   register={register}
 *   errorMessage={errors.soldOutYn?.message}
 * />
 */
export default function RadioGroup({
  label,
  name,
  options = [],
  register,
  value,
  onChange,
  errorMessage,
  direction = "row", // row | column
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
              onChange={isRHF ? undefined : onChange}
            />
            <span className="radio-label">{opt.label}</span>
          </label>
        ))}
      </div>

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
