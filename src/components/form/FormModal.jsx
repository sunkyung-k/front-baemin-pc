import React from "react";
import Modal from "@/components/common/Modal";

/**
 * FormModal (공용 폼 모달)
 * - Modal.jsx를 내부적으로 사용
 * - 등록/수정/작성 등 모든 폼 모달에서 재사용
 * - RHF(useForm) 또는 일반 onSubmit 둘 다 호환
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
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <form
        onSubmit={onSubmit}
        className={`form-modal ${className}`}
        noValidate
      >
        <div className="form-modal__body">{children}</div>

        <div className="form-modal__footer">
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={disabled}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
