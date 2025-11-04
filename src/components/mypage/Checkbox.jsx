import React from "react";

export default function Checkbox({
  label,
  name,
  options = [],
  register,
  watch,
  errorMessage,
  hint,
  onChangeCustom,
}) {
  const selected = watch?.(name) || [];

  return (
    <div className="checkbox-field">
      {label && <label className="checkbox-label">{label}</label>}

      <div className="checkbox-box">
        {options.map((option, index) => {
          const valueItem =
            typeof option === "object" ? option.id.toString() : option;
          const text = typeof option === "object" ? option.name : option;
          const isChecked = selected.includes(valueItem);

          return (
            <label
              key={index}
              className={`checkbox-input ${errorMessage ? "error" : ""}`}
            >
              <input
                type="checkbox"
                value={valueItem}
                checked={isChecked}
                {...register(name, {
                  onChange: (e) => onChangeCustom?.(e),
                })}
              />
              <span>{text}</span>
            </label>
          );
        })}
      </div>

      {errorMessage && <p className="checkbox-error">{errorMessage}</p>}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
