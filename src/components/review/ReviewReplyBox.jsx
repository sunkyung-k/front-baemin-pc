// src/components/review/ReviewReplyBox.jsx
import React, { useState } from "react";
import TextareaField from "@/components/form/TextareaField";
import { useReviewReply } from "@/hooks/review/useReviewReply";
import { useAdminReview } from "@/hooks/admin/useAdminReview";
import { authStore } from "@/store/authStore";

export default function ReviewReplyBox({
  reply,
  reviewId,
  onClose,
  onOpen,
  isReadOnly = false,
}) {
  const { createReply, updateReply, removeReply } = useReviewReply();
  const { replyDelete } = useAdminReview();

  const { userRole } = authStore();
  const isAdmin = userRole === "ROLE_ADMIN";

  const [content, setContent] = useState(reply?.content || "");
  const [isEditing, setEditing] = useState(!reply && !isReadOnly);
  const [loading, setLoading] = useState(false);

  // 관리자 삭제 여부
  const isDeletedByAdmin = reply?.delYn === "A";

  // 본인 삭제 여부
  const isDeleted = reply?.delYn === "Y";

  // 표시될 문구
  const displayContent = isDeleted
    ? "해당 답변은 삭제된 답변입니다."
    : reply?.content;

  /** 저장 */
  const handleSave = () => {
    if (!content.trim()) return;
    setLoading(true);

    const payload = reply
      ? { reviewReplyId: reply.reviewReplyId, reviewId, content }
      : { reviewId, content };

    const mutation = reply ? updateReply : createReply;

    mutation.mutate(payload, {
      onSuccess: () => {
        setEditing(false);
        onClose?.();
      },
      onSettled: () => setLoading(false),
    });
  };

  /** 수정 */
  const handleEdit = () => {
    setEditing(true);
    onOpen?.();
  };

  /** 삭제 */
  const handleDelete = () => {
    if (!window.confirm("정말 답글을 삭제하시겠습니까?")) return;

    setLoading(true);

    removeReply.mutate(
      {
        reviewReplyId: reply.reviewReplyId,
        reviewId,
      },
      {
        onSuccess: () => {
          setContent("");
          setEditing(false); // '보기 모드'로 전환
          onClose?.(); // '수정' 상태에서 삭제했을 경우를 대비해 닫기 처리
        },
        onSettled: () => setLoading(false),
      }
    );
  };

  /** 관리자 삭제 */
  const handleAdminReplyDelete = () => {
    if (!reply) return;
    if (!window.confirm("정말 이 답변을 삭제하시겠습니까?")) return;

    replyDelete.mutate(reply.reviewReplyId);
  };

  return (
    <div className={`review-reply-box ${isReadOnly ? "readonly" : ""}`}>
      {/* 보기 모드 */}
      {!isEditing && reply && (
        <div className="reply-view">
          <div className="reply-header">
            <strong>사장님 답변</strong>

            {!isReadOnly && !isDeletedByAdmin && !isDeleted && (
              <div className="reply-btn">
                <button
                  className="btn btn-sm btn-hv"
                  onClick={handleEdit}
                  disabled={loading}
                >
                  수정
                </button>
                <button
                  className="btn btn-sm btn-hv"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            )}

            {isAdmin && !isDeletedByAdmin && !isDeleted && (
              <button
                className="btn btn-danger btn-sm admin-delete"
                onClick={handleAdminReplyDelete}
              >
                답변 삭제
              </button>
            )}
          </div>

          <p
            className={`reply-content ${
              isDeletedByAdmin || isDeleted ? "deleted-review" : ""
            }`}
          >
            {displayContent}
          </p>
        </div>
      )}

      {/* 작성·수정 모드 */}
      {!isReadOnly && isEditing && !isDeletedByAdmin && !isDeleted && (
        <div className="review-reply-form">
          <TextareaField
            name="replyContent"
            placeholder="사장님 답변을 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="reply-btns">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={loading || !content.trim()}
            >
              {reply ? "수정" : "등록"}
            </button>

            {reply && (
              <button
                className="btn btn-secondary-line btn-sm"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
