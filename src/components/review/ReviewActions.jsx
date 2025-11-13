// ReviewActions.js (전체 소스)

import React from "react";

/**
 * ReviewActions
 * --------------------------------------------------
 * 역할별 버튼 공용 컴포넌트
 */
export default function ReviewActions({
  role,
  reply,
  onEdit,
  onDelete,
  onToggleReplyMode,
}) {
  return (
    <>
      {role === "user" && (
        <div className="review-actions">
          <button className="btn btn-secondary-line btn-sm" onClick={onEdit}>
            수정
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            삭제
          </button>
        </div>
      )}
    </>
  );
}
