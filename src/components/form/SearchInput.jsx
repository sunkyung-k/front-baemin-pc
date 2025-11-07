import React, { useState, useEffect } from "react";
import {
  FaLocationCrosshairs,
  FaMagnifyingGlass,
  FaMagnifyingGlassLocation,
} from "react-icons/fa6";

/**
 * 🔍 SearchInput (공용 입력 UI)
 * - mode="address": 주소 전용 (readonly)
 * - mode="search": 메뉴/가게 검색 (입력 가능)
 * - variant="sub": 가게리스트 중간에 쓰는 얇은 검색창
 */
export default function SearchInput({
  value = "",
  setValue,
  placeholder = "검색어를 입력하세요",
  onSearch,
  onGetLocation,
  onSearchAddress,
  loading = false,
  mode = "search",
  variant = "",
}) {
  const [localValue, setLocalValue] = useState(value);

  // 외부 value 동기화
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // 검색 실행
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = localValue.trim();
    setValue?.(trimmed);
    onSearch?.(trimmed);
  };

  return (
    <form className={`input-round ${mode} ${variant}`} onSubmit={handleSubmit}>
      {/* 📍 주소 모드 */}
      {mode === "address" && (
        <button
          type="button"
          onClick={onGetLocation}
          disabled={loading}
          title="현재 위치 불러오기"
          className="btn-location"
        >
          {loading ? "⏳" : <FaLocationCrosshairs size={18} />}
        </button>
      )}

      {/* ✅ 주소 모드에서는 input 대신 div로 (입력 불가 카드 느낌) */}
      {mode === "address" ? (
        <div className="address-display">
          {value || "배달받을 주소를 입력해주세요"}
        </div>
      ) : (
        <input
          type="search"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      )}

      {/* 🔍 버튼 */}
      <button
        type={mode === "address" ? "button" : "submit"}
        onClick={mode === "address" ? onSearchAddress : undefined}
        title={mode === "address" ? "주소 검색" : "검색"}
        className="btn-search"
      >
        {mode === "address" ? (
          <FaMagnifyingGlassLocation size={18} />
        ) : (
          <FaMagnifyingGlass size={18} />
        )}
      </button>
    </form>
  );
}
