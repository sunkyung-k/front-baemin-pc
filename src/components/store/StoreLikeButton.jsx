import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { authStore } from "@/store/authStore";

/**
 * LikeButton
 * -------------------------------------------------
 * - 상태 제어는 부모에서 담당
 * - 클릭 시 링크 이동 방지 및 이벤트 전파 차단
 * - 비회원(GUEST)일 경우: 로그인 유도 + toggle 호출하지 않음
 * - 관리자일 경우: 찜버튼 숨김
 */

export default function LikeButton({
  isActive = false,
  onToggle,
  round = true,
  animated = true,
}) {
  const isAuthenticated = authStore((s) => s.isAuthenticated)();
  const userRole = authStore((s) => s.userRole);
  const isAdmin = userRole === "ROLE_ADMIN";

  // 관리자면 찜버튼 숨김
  if (isAdmin) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("로그인이 필요한 기능입니다. 로그인 후 이용해주세요.");
      return;
    }

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
