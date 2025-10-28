import React from "react";

function Checkbox({ label, options = [], selected = [], onChange }) {
  return (
    <>
      {label && <p className="checkbox-label">{label}</p>}
      <div className="checkbox-field">
        {options.map((option) => (
          <label key={option} className="checkbox-input">
            <input
              type="checkbox"
              value={option}
              checked={selected.includes(option)} // 부모가 상태 관리
              onChange={() => onChange(option)} // 부모로 이벤트 전달
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </>
  );
}

export default Checkbox;
