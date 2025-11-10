/**
 * Pagination (공용 페이지네이션 컴포넌트)
 * --------------------------------------------------
 * React 프로젝트 전역에서 재사용 가능한 페이지네이션 컴포넌트.
 * Spring Data JPA의 기본 페이지 구조(pageInfo)에 맞춰 설계됨.
 * 마이페이지, 메인 리스트, 관리자 페이지 등 모든 목록형 화면에서 공용 사용 가능.
 *
 * [Props 설명]
 * --------------------------------------------------
 * @param {object} pageInfo
 *   - 백엔드에서 내려주는 페이지 정보 객체
 *   {
 *     page: number,           // 현재 페이지 (0부터 시작)
 *     totalPages: number,     // 전체 페이지 수
 *     hasNext: boolean,       // 다음 페이지 존재 여부
 *     hasPrevious: boolean,   // 이전 페이지 존재 여부
 *     first: boolean,         // 첫 페이지 여부
 *     last: boolean           // 마지막 페이지 여부
 *   }
 *
 * @param {function} onPageChange
 *   - 페이지 변경 시 호출되는 콜백 함수
 *   - 클릭된 페이지 번호(newPage: number)를 인자로 전달
 *   - 일반적으로 React useState 또는 React Query refetch와 함께 사용
 *
 */

import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

export default function Pagination({ pageInfo, onPageChange }) {
  if (!pageInfo || pageInfo.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrevious } = pageInfo;
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <ul className="pagination-box">
      {/* 처음으로 이동 */}
      <li
        className={`page-item ${page === 0 ? "disabled" : ""}`}
        onClick={() => page > 0 && onPageChange(0)}
      >
        <FaAngleDoubleLeft />
      </li>

      {/* 이전 페이지 */}
      <li
        className={`page-item ${!hasPrevious ? "disabled" : ""}`}
        onClick={() => hasPrevious && onPageChange(page - 1)}
      >
        <FaChevronLeft />
      </li>

      {/* 페이지 번호 */}
      {pages.map((p) => (
        <li
          key={p}
          className={`page-item ${p === page ? "active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </li>
      ))}

      {/* 다음 페이지 */}
      <li
        className={`page-item ${!hasNext ? "disabled" : ""}`}
        onClick={() => hasNext && onPageChange(page + 1)}
      >
        <FaChevronRight />
      </li>

      {/* 마지막 페이지 */}
      <li
        className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
        onClick={() => page < totalPages - 1 && onPageChange(totalPages - 1)}
      >
        <FaAngleDoubleRight />
      </li>
    </ul>
  );
}
