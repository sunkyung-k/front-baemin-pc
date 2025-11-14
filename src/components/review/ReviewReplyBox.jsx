import React, { useState } from "react";
import TextareaField from "@/components/form/TextareaField";
import { useReviewReply } from "@/hooks/review/useReviewReply";
import { useAdminReview } from "@/hooks/admin/useAdminReview";
import { authStore } from "@/store/authStore";

/**
 * ReviewReplyBox (사장님 답글 / 공용 보기)
 * --------------------------------------------------
 * - reply: { reviewReplyId, content, ... } or null
 * - reviewId: 현재 리뷰 ID
 * - isReadOnly: 점주 외엔 보기 전용
 */
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

  // ⭐ 삭제된 리뷰는 답글 비활성
  const isDeletedByAdmin =
    reply?.delYn === "A" ||
    content === "해당 리뷰는 관리자에 의해 삭제된 리뷰입니다.";

  /** 저장 */
  const handleSave = async () => {
    if (!content.trim()) return;

    try {
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
    } catch (err) {
      setLoading(false);
    }
  };

  /** 수정 모드 */
  const handleEdit = () => {
    setEditing(true);
    onOpen?.();
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!window.confirm("정말 답글을 삭제하시겠습니까?")) return;

    try {
      setLoading(true);
      removeReply.mutate(reply.reviewReplyId, {
        onSuccess: () => {
          setContent("");
          setEditing(true);
          onOpen?.();
        },
        onSettled: () => setLoading(false),
      });
    } catch (err) {
      setLoading(false);
    }
  };

  /** 관리자 삭제 */
  const handleAdminReplyDelete = () => {
    if (!reply) return;
    if (!window.confirm("정말 이 답변을 삭제하시겠습니까?")) return;

    replyDelete.mutate(reply.reviewReplyId);
  };

  return (
    <div className={`review-reply-box ${isReadOnly ? "readonly" : ""}`}>
      {/* 보기 */}
      {!isEditing && reply && (
        <div className="reply-view">
          <div className="reply-header">
            <strong>사장님 답변</strong>

            {/* 점주 버튼 */}
            {!isReadOnly && !isDeletedByAdmin && (
              <div className="reply-btn">
                <button
                  type="button"
                  className="btn btn-sm btn-hv"
                  onClick={handleEdit}
                  disabled={loading}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-hv"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            )}

            {/* 관리자 버튼 */}
            {isAdmin && !isDeletedByAdmin && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleAdminReplyDelete}
              >
                답변 삭제
              </button>
            )}
          </div>

          {/* 답글 내용 */}
          <p
            className={`reply-content ${
              isDeletedByAdmin ? "deleted-review" : ""
            }`}
          >
            {reply.content}
          </p>
        </div>
      )}

      {/* 작성/수정 모드 */}
      {!isReadOnly && isEditing && !isDeletedByAdmin && (
        <div className="review-reply-form">
          <TextareaField
            name="replyContent"
            placeholder="사장님 답글을 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="reply-btns">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={loading || !content.trim()}
            >
              {reply ? "수정 완료" : "등록"}
            </button>

            {reply && (
              <button
                type="button"
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
