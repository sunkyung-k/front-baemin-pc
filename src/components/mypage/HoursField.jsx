import React, { useMemo } from "react";

/**
 * 공용 HoursField
 * RHF + 수동 상태(value/onChange) 둘 다 대응
 * InputField 스타일 완벽 통일 버전
 */
export default function HoursField({
  label = "영업시간",
  openName = "openTime",
  closeName = "closeTime",
  errorMessage,
  register, // RHF or dummyRegister
  value, // 수동 제어용 { open, close }
  onChange, // 수동 제어용
  minHour = 0, // 시작 00시
  maxHour = 23, // 종료 23시 (24시 제외)
  hint = "",
  disabled = false,
  className = "",
}) {
  /** ✅ 00:00 ~ 23:00 (1시간 단위) 생성 **/
  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
      const h = String(hour).padStart(2, "0");
      times.push(`${h}:00`);
    }
    return times;
  }, [minHour, maxHour]);

  /** ✅ RHF register 감지 **/
  let openProps = {};
  let closeProps = {};

  if (typeof register === "function") {
    const openTemp = register(openName);
    const closeTemp = register(closeName);

    const isRHFRegister =
      openTemp &&
      (typeof openTemp.onBlur === "function" || openTemp.ref !== undefined);

    if (isRHFRegister) {
      openProps = { ...openTemp };
      closeProps = { ...closeTemp };
    }
  }

  /** ✅ 수동 제어 모드 (value/onChange) **/
  if (onChange) {
    openProps.onChange = (e) => onChange({ ...value, open: e.target.value });
    closeProps.onChange = (e) => onChange({ ...value, close: e.target.value });
  }

  /** ✅ 렌더링 **/
  return (
    <div className={`hours-field ${className}`}>
      {label && (
        <label className="hours-label" htmlFor={openName}>
          {label}
        </label>
      )}

      <div className="hours-box">
        <select
          id={openName}
          name={openName}
          disabled={disabled}
          className={`hours-sel ${errorMessage ? "error" : ""}`}
          {...openProps}
        >
          <option value="">시작 시간</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <span className="hours-divider">~</span>

        <select
          id={closeName}
          name={closeName}
          disabled={disabled}
          className={`hours-sel ${errorMessage ? "error" : ""}`}
          {...closeProps}
        >
          <option value="">종료 시간</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && <p className="hours-error">{errorMessage}</p>}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
