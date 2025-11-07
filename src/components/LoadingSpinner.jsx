import React from "react";

/**
 * 공용 로딩 스피너 컴포넌트
 * - 페이지 전용, 버튼 내부용, 섹션용으로 모두 재활용 가능
 *
 * @param {number} size - 원 크기(px)
 * @param {string} message - 로딩 메시지
 * @param {boolean} fullscreen - 전체 화면 중앙 배치 여부
 */
function LoadingSpinner({ size = 48, message = "", fullscreen = false }) {
  return (
    <div className={`loading-wrapper ${fullscreen ? "fullscreen" : ""}`}>
      <div
        className="loading-spinner"
        style={{ width: size, height: size }}
      ></div>
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
