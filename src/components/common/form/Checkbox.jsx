import React from "react";

export default function Checkbox({ label, name, options = [], register, watch }) {
  const selected = watch(name) || [];

  return (
    <>
      {label && <p className="checkbox-label">{label}</p>}
      <div className="checkbox-field">
        {options.map((option, index) => {
          const value = typeof option === "object" ? option.id.toString() : option;
          const text = typeof option === "object" ? option.name : option;
          const isChecked = selected.includes(value);

          return (
            <label key={index} className="checkbox-input">
              <input
                type="checkbox"
                value={value}
                {...register(name)}
                checked={isChecked}
              />
              <span>{text}</span>
            </label>
          );
        })}
      </div>
    </>
  );
}
