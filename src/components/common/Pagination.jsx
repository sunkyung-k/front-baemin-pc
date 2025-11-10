import React from "react";

/**
 * 범용 페이지네이션 컴포넌트 (PageVO 호환)
 * --------------------------------------------------
 * 백엔드 PageVO 계산 로직 그대로 지원
 * @param {object} pageInfo - PageVO에서 내려온 데이터
 * @param {function} onChange - 페이지 변경 콜백 (page: 0부터 시작)
 */
export default function Pagination({ pageInfo, onChange }) {
  if (!pageInfo || !pageInfo.totalPage || pageInfo.totalPage <= 1) return null;

  // 안전하게 기본값 설정 (서버에서 일부 값이 누락돼도 깨지지 않게)
  const {
    page = 0,
    totalPage = 1,
    blockPerCount = 10,
    nowBlock = 0,
    totalBlock = 1,
  } = pageInfo;

  const startPage = nowBlock * blockPerCount;
  const endPage = Math.min(startPage + blockPerCount, totalPage);

  const hasPrevBlock = nowBlock > 0;
  const hasNextBlock = nowBlock + 1 < totalBlock;

  return (
    <div className="pagination">
      {/* 처음 */}
      <button onClick={() => onChange(0)} disabled={page === 0}>
        처음
      </button>

      {/* 이전 블럭 */}
      <button
        onClick={() => onChange(Math.max(startPage - 1, 0))}
        disabled={!hasPrevBlock}
      >
        이전
      </button>

      {/* 페이지 번호 */}
      {Array.from({ length: endPage - startPage }, (_, i) => {
        const pageNum = startPage + i;
        return (
          <button
            key={pageNum}
            className={pageNum === page ? "active" : ""}
            onClick={() => onChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        );
      })}

      {/* 다음 블럭 */}
      <button
        onClick={() => onChange(endPage)}
        disabled={!hasNextBlock || endPage >= totalPage}
      >
        다음
      </button>

      {/* 마지막 */}
      <button
        onClick={() => onChange(totalPage - 1)}
        disabled={page === totalPage - 1}
      >
        마지막
      </button>
    </div>
  );
}
