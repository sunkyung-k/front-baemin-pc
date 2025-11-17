import React from "react";
import Modal from "@/components/common/Modal";

/**
 * FormModal (공용 폼 모달)
 * - RHF(useForm)의 handleSubmit을 그대로 받음
 * - e.preventDefault() 제거해야 검증 → submit 함수 호출됨
 */
export default function FormModal({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel = "등록",
  disabled = false,
  className = "",
  footer,
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <form
        onSubmit={onSubmit} // RHF handleSubmit 직접 연결
        className={`form-modal ${className}`}
        noValidate
      >
        <div className="form-modal__body">{children}</div>

        <div className="form-modal__footer">
          {footer ? (
            footer
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={disabled}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
