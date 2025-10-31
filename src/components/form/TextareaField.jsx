import React from "react";

export default function TextareaField({
  label,
  name,
  placeholder,
  errorMessage,
  register,
  value,
  onChange,
  onFocus,
  disabled = false,
}) {
  let inputProps = {};

  if (typeof register === "function") {
    const temp = register(name);
    const isRHFRegister =
      temp && (typeof temp.onBlur === "function" || temp.ref !== undefined);

    if (isRHFRegister) {
      inputProps = { ...temp };
    }
  }

  if (onChange) inputProps.onChange = onChange;
  if (value !== undefined) inputProps.value = value;

  return (
    <div className="textarea-field">
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        id={name}
        placeholder={placeholder}
        rows={4}
        disabled={disabled}
        className={`textarea-txt ${errorMessage ? "error" : ""}`}
        {...inputProps}
        onFocus={onFocus}
      />
      {errorMessage && <p className="textarea-error">{errorMessage}</p>}
    </div>
  );
}
