// src/components/common/form/InputField.jsx
import React from "react";
export default function InputField({
  label,
  type = "text",
  name,
  placeholder,
  errorMessage,
  register,
  onFocus,
  autoComplete = "off",
}) {
  return (
    <div className="input-field">
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`${errorMessage ? "error input-txt" : "input-txt"}`}
        {...register(name)}
        onFocus={onFocus}
        autoComplete={autoComplete}
      />
      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
