import React, { useMemo } from "react";

/**
 * HoursField (react-hook-form 완전 대응 버전)
 * yup required 검증 정상 작동하도록 RHF의 value 직접 연결
 */
export default function HoursField({
  label = "영업시간",
  openName = "openTime",
  closeName = "closeTime",
  openError,
  closeError,
  register,
  watch,
  hint = "",
}) {
  // 00:00 ~ 23:00까지 시간 옵션 생성
  const timeOptions = useMemo(() => {
    return Array.from(
      { length: 24 },
      (_, i) => `${String(i).padStart(2, "0")}:00`
    );
  }, []);

  // RHF에서 실시간 값 가져오기
  const openValue = watch ? watch(openName) || "" : "";
  const closeValue = watch ? watch(closeName) || "" : "";

  return (
    <div className="hours-field">
      {label && <label className="hours-label">{label}</label>}

      <div className="hours-box">
        <select
          {...register(openName)}
          value={openValue}
          className={`hours-sel ${openError ? "error" : ""}`}
        >
          <option value="">시작 시간</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="hours-divider">~</span>
        <select
          {...register(closeName)}
          value={closeValue}
          className={`hours-sel ${closeError ? "error" : ""}`}
        >
          <option value="">종료 시간</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {openError && <p className="hours-error">{openError}</p>}
      {closeError && !openError && <p className="hours-error">{closeError}</p>}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
