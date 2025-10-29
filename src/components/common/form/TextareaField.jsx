// src/components/common/form/TextareaField.jsx
import React from "react";

export default function TextareaField({
  label,
  name,
  placeholder,
  errorMessage,
  register,
  onFocus,
  className = "",
}) {
  return (
    <div className={`textarea-field ${className}`}>
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        id={name}
        placeholder={placeholder}
        rows={4}
        className={`${errorMessage ? "error textarea-txt" : "textarea-txt"}`}
        onFocus={onFocus}
        {...(register ? register(name) : {})}
      />
      {errorMessage && <p className="textarea-error">{errorMessage}</p>}
    </div>
  );
}
