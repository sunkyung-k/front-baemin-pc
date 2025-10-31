import React from "react";

/**
 * 공통 EmptyState 컴포넌트 (전역 스타일 버전)
 * @param {ReactNode} icon - react-icons 컴포넌트 (예: <FaUtensils />)
 * @param {string} title - 메인 문구
 * @param {string} description - 부가 설명
 * @param {boolean} dashed - 점선 테두리 여부 (기본 true)
 * @param {ReactNode} children - 버튼 등 추가 요소
 */
export default function EmptyState({
  icon,
  title = "데이터가 없습니다.",
  description = "새 데이터를 등록해주세요.",
  dashed = true,
  children,
}) {
  return (
    <div className={`empty-state ${dashed ? "empty-state--dashed" : ""}`}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <p className="empty-state__title">{title}</p>
      <small className="empty-state__desc">{description}</small>
      {children && <div className="empty-state__extra">{children}</div>}
    </div>
  );
}
