import React from "react";

/**
 * ReviewActions
 * --------------------------------------------------
 * 역할별 버튼 공용 컴포넌트
 */
export default function ReviewActions({ role, reply, onEdit, onDelete }) {
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

      {role === "owner" && (
        <div className="review-actions">
          {!reply && (
            <button className="btn btn-outline btn-sm">답글 달기</button>
          )}
        </div>
      )}
    </>
  );
}
