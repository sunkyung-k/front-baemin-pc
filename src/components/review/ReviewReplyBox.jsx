import React, { useState } from "react";

/**
 * ReviewReplyBox
 * --------------------------------------------------
 * - 점주가 리뷰에 답글 작성/수정/삭제
 */
export default function ReviewReplyBox({ reply, reviewId }) {
  const [isEditing, setEditing] = useState(!reply);
  const [content, setContent] = useState(reply?.content || "");

  const handleSave = () => {
    console.log("✅ 답글 저장:", { reviewId, content });
    setEditing(false);
  };

  const handleDelete = () => {
    console.log("🗑️ 답글 삭제:", reviewId);
  };

  return (
    <div className="review-reply">
      {isEditing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="reply-textarea"
          />
          <div className="reply-btns">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              저장
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="reply-content">{reply.content}</p>
          <div className="reply-footer">
            <span className="reply-date">
              {reply.updateDate?.split(" ")[0]}
            </span>
            <div className="reply-btns">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(true)}
              >
                수정
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
