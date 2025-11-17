import React, { useEffect, useState } from "react";
import { useRef } from "react";
import ReactDOM from "react-dom";
import { IoClose } from "react-icons/io5";

/**
 * 공용 모달 컴포넌트
 * - ESC 닫기 없음
 * - 오버레이 클릭 / 닫기 버튼 클릭으로 닫힘
 * - 열리고/닫힐 때 부드러운 트랜지션
 * - 첫 번째 input 자동 포커스
 * - React Portal로 body 최상단에 렌더링됨
 */
export default function Modal({ isOpen, title, onClose, children }) {
  const [isActive, setIsActive] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const modalRef = useRef(null);

  const modalRoot = document.getElementById("global-modal-root");

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      setTimeout(() => {
        setIsActive(true);

        // 첫 번째 입력 요소 자동 포커스
        const firstInput = modalRef.current?.querySelector(
          "input, textarea, select"
        );
        firstInput?.focus();
      }, 10);
    } else if (shouldRender) {
      setIsActive(false);

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // 렌더 필요 없으면 즉시 종료
  if (!shouldRender || !modalRoot) return null;

  // 오버레이 눌렀을 때 닫기
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  const modalElement = (
    <div
      className={`modal-overlay ${isActive ? "active" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>
          <IoClose />
        </button>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );

  // Portal 렌더링
  return ReactDOM.createPortal(modalElement, modalRoot);
}
