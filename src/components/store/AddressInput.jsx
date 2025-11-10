import React from "react";
import {
  FaLocationCrosshairs,
  FaMagnifyingGlassLocation,
} from "react-icons/fa6";

/**
 * 주소 선택형
 */
export default function AddressInput({
  value = "",
  onGetLocation,
  onSearchAddress,
  loading = false,
  variant = "default",
}) {
  const isCompact = variant === "compact";
  const iconSize = isCompact ? 14 : 18;

  return (
    <div className={`address-box ${isCompact ? "address-box--compact" : ""}`}>
      {/* 현재 위치 버튼 */}
      <button
        type="button"
        onClick={onGetLocation}
        disabled={loading}
        className="address-btn address-btn--location"
        title="현재 위치 불러오기"
        aria-label="현재 위치 불러오기"
      >
        {loading ? "⏳" : <FaLocationCrosshairs size={iconSize} />}
      </button>

      {/* 주소 표시 (클릭 시 검색창 열림) */}
      <button
        type="button"
        className="address-display"
        onClick={onSearchAddress}
        title="주소 검색하기"
        aria-label="주소 검색하기"
      >
        {value || "배달받을 주소를 입력해주세요"}
      </button>

      {/* 주소 검색 버튼 */}
      <button
        type="button"
        onClick={onSearchAddress}
        className="address-btn address-btn--search"
        title="주소 검색"
        aria-label="주소 검색"
      >
        <FaMagnifyingGlassLocation size={iconSize} />
      </button>
    </div>
  );
}
