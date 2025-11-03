import React from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";

/**
 * - 입력창은 읽기 전용 (직접 입력 불가)
 * - onGetLocation 클릭 시 현재 위치 좌표 가져오기
 */
function ImportAddress({ userAddress, onGetLocation }) {
  return (
    <div className="searchBox">
      <button
        type="button"
        className="btn btn-default btn-round btn-primary-line"
        onClick={onGetLocation}
        title="현재 위치 불러오기"
      >
        <FaLocationCrosshairs size="16" />
      </button>

      <input
        type="text"
        value={userAddress || ""}
        readOnly
        placeholder="현재 위치를 불러와주세요."
      />
    </div>
  );
}

export default ImportAddress;
