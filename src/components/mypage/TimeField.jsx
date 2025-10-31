// import React from "react";

// /**
//  * TimeField — 30분 단위 전용 time input
//  * RHF(register) or 수동 제어(value/onChange) 모두 대응
//  * onBlur 시 30분 단위 검증 (직접 입력 방지)
//  */
// export default function TimeField({
//   label,
//   name,
//   errorMessage,
//   register,
//   value,
//   onChange,
//   onFocus,
//   onBlur, // 외부에서 커스텀 blur 처리도 가능
//   disabled = false,
//   className = "",
// }) {
//   let inputProps = {};

//   // RHF register 감지
//   if (typeof register === "function") {
//     const temp = register(name);
//     const isRHFRegister =
//       temp && (typeof temp.onBlur === "function" || temp.ref !== undefined);

//     if (isRHFRegister) {
//       inputProps = { ...temp };
//     }
//   }

//   // 수동 제어 모드
//   if (onChange) inputProps.onChange = onChange;
//   if (value !== undefined) inputProps.value = value;

//   // 🧩 30분 단위 검증 로직
//   const handleBlur = (e) => {
//     const val = e.target.value;
//     if (!val) return;

//     const [h, m] = val.split(":");
//     const minutes = Number(m);

//     // 30분 단위가 아니면 알림 후 리셋
//     if (minutes % 30 !== 0) {
//       alert("⚠️ 30분 단위로만 입력 가능합니다!");
//       e.target.value = "";
//       if (onChange) onChange({ target: { name, value: "" } }); // RHF 수동 반영
//     }

//     // RHF 또는 외부 onBlur도 정상 호출되게
//     if (inputProps.onBlur) inputProps.onBlur(e);
//     if (onBlur) onBlur(e);
//   };

//   return (
//     <div className={`input-field ${className}`}>
//       {label && (
//         <label htmlFor={name} className="input-label">
//           {label}
//         </label>
//       )}
//       <input
//         id={name}
//         name={name}
//         type="time"
//         step="1800"
//         disabled={disabled}
//         className={`input-txt ${errorMessage ? "error" : ""}`}
//         {...inputProps}
//         onFocus={onFocus}
//         onBlur={handleBlur}
//       />
//       {errorMessage && <p className="input-error">{errorMessage}</p>}
//     </div>
//   );
// }

import React, { useMemo } from "react";

/**
 * TimeField (실무형)
 * - 30분 단위 시간 선택 전용
 * - RHF(register) / 수동 제어 둘 다 지원
 * - 브라우저 호환 100%, 디자인 통일
 */
export default function TimeField({
  label,
  name,
  errorMessage,
  register,
  value,
  onChange,
  disabled = false,
  className = "",
  minHour = 9, // 기본 09:00 시작
  maxHour = 18, // 기본 18:00 종료
}) {
  // 09:00 ~ 18:00 사이 30분 단위 생성
  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === maxHour && min > 0) break; // 18:30 제외
        const h = String(hour).padStart(2, "0");
        const m = String(min).padStart(2, "0");
        times.push(`${h}:${m}`);
      }
    }
    return times;
  }, [minHour, maxHour]);

  // RHF register 감지
  let inputProps = {};
  if (typeof register === "function") {
    const temp = register(name);
    const isRHFRegister =
      temp && (typeof temp.onBlur === "function" || temp.ref !== undefined);
    if (isRHFRegister) inputProps = { ...temp };
  }

  // 수동 제어 모드
  if (onChange) inputProps.onChange = onChange;
  if (value !== undefined) inputProps.value = value;

  return (
    <div className={`input-field ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        disabled={disabled}
        className={`input-txt ${errorMessage ? "error" : ""}`}
        {...inputProps}
      >
        <option value="">시간 선택</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
