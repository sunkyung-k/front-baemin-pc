import React from "react";
import {
  FaLocationCrosshairs,
  FaMagnifyingGlassLocation,
} from "react-icons/fa6";

/**
 * AddressInput (공통 + variant 버전)
 * -----------------------------------------------------
 * variant="default" → 홈
 * variant="compact" → 헤더 / 상세 / 리스트 상단
 * -----------------------------------------------------
 */
export default function AddressInput({
  value = "",
  onGetLocation,
  onSearchAddress,
  loading = false,
  variant = "default",
}) {
  const iconSize = variant === "compact" ? 13 : 16;

  return (
    <div className={`address-box address-box--${variant}`}>
      <input
        type="text"
        readOnly
        value={value}
        onClick={onSearchAddress}
        className={`address-display address-display--${variant}`}
        placeholder="배달받을 주소를 입력해주세요"
      />

      <div className={`address-actions address-actions--${variant}`}>
        <button
          type="button"
          onClick={onGetLocation}
          disabled={loading}
          className={`address-btn address-btn--location address-btn--${variant}`}
        >
          <FaLocationCrosshairs size={iconSize} />
          {variant === "default" && (
            <span>{loading ? "위치 확인 중..." : "현재 위치"}</span>
          )}
        </button>

        <button
          type="button"
          onClick={onSearchAddress}
          className={`address-btn address-btn--search address-btn--${variant}`}
        >
          <FaMagnifyingGlassLocation size={iconSize} />
          {variant === "default" && <span>주소 찾기</span>}
        </button>
      </div>
    </div>
  );
}
