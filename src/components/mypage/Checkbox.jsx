import React from "react";

export default function Checkbox({
  label,
  name,
  options = [],
  register,
  watch,
  value,
  errorMessage,
  hint,
}) {
  const raw = watch ? watch(name) : value;
  const selected = Array.isArray(raw)
    ? raw.map(String)
    : raw
    ? [String(raw)]
    : [];

  return (
    <>
      <div className="checkbox-field">
        {label && (
          <label htmlFor={name} className="checkbox-label">
            {label}
          </label>
        )}

        <div className="checkbox-box">
          {options.map((option, index) => {
            const valueItem =
              typeof option === "object" ? option.id.toString() : option;
            const text = typeof option === "object" ? option.name : option;
            const isChecked = selected.includes(valueItem);

            const reg = typeof register === "function" ? register(name) : {};

            return (
              <label
                key={index}
                className={`checkbox-input ${errorMessage ? "error" : ""}`}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={valueItem}
                  checked={isChecked}
                  {...reg}
                />
                <span>{text}</span>
              </label>
            );
          })}
        </div>

        {errorMessage && <p className="checkbox-error">{errorMessage}</p>}
        {hint && <p className="hint">{hint}</p>}
      </div>
    </>
  );
}
