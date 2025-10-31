import React from "react";

export default function Checkbox({
  label,
  name,
  options = [],
  register,
  watch,
  value,
  onChange,
  errorMessage,
}) {
  const selected = watch ? watch(name) || [] : value || [];

  let inputProps = {};

  if (typeof register === "function") {
    const temp = register(name);
    const isRHFRegister =
      temp && (typeof temp.onBlur === "function" || temp.ref !== undefined);
    if (isRHFRegister) {
      inputProps = { ...temp };
    }
  }

  // RHF 외의 수동 제어 (value, onChange가 있을 때)
  if (onChange) inputProps.onChange = onChange;

  return (
    <>
      {label && (
        <label htmlFor={name} className="checkbox-label">
          {label}
        </label>
      )}

      <div className="checkbox-field">
        {options.map((option, index) => {
          const valueItem = typeof option === "object" ? option.id.toString() : option;
          const text = typeof option === "object" ? option.name : option;
          const isChecked = selected.includes(valueItem);

          return (
            <label key={index} className="checkbox-input">
              <input
                type="checkbox"
                name={name}
                value={valueItem}
                checked={isChecked}
                {...inputProps}
              />
              <span>{text}</span>
            </label>
          );
        })}

        {errorMessage && <p className="checkbox-error">{errorMessage}</p>}
      </div>
    </>
  );
}
