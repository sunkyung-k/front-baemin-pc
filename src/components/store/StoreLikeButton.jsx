import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

/**
 * LikeButton
 * -------------------------------------------------
 * - 상태 제어는 부모에서 담당
 * - 클릭 시 링크 이동 방지 및 이벤트 전파 차단
 */
export default function LikeButton({
  isActive = false,
  onToggle,
  round = true,
  animated = true,
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.(!isActive);
  };

  return (
    <button
      type="button"
      aria-label={isActive ? "찜 취소" : "찜하기"}
      className={`btn-like ${round ? "round" : ""} ${
        isActive ? "active" : ""
      } ${animated ? "animated" : ""}`}
      onClick={handleClick}
    >
      {isActive ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}
