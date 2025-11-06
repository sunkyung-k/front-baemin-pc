import React from "react";
import {
  FaLocationCrosshairs,
  FaMagnifyingGlassLocation,
} from "react-icons/fa6";

export default function ImportAddress({
  userAddress,
  onGetLocation,
  onSearchAddress,
  loading = false,
}) {
  return (
    <div className="input-round address-box">
      {/* 주소 표시창 */}
      <input
        type="text"
        value={userAddress || ""}
        readOnly
        placeholder="내 위치를 불러오거나 주소를 선택해주세요."
      />

      {/* 내 위치 */}
      <button
        type="button"
        onClick={onGetLocation}
        disabled={loading}
        title="내 위치 불러오기"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "..." : <FaLocationCrosshairs size={16} />}
      </button>

      {/* 주소 검색 */}
      <button
        type="button"
        onClick={onSearchAddress}
        title="주소 검색하기"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <FaMagnifyingGlassLocation size={16} />
      </button>
    </div>
  );
}
