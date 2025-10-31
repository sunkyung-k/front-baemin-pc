import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

/**
 * 공용 모달 컴포넌트
 * - ESC 닫기 없음
 * - 오버레이 클릭, 닫기 버튼 클릭으로 닫힘
 * - 열리고/닫힐 때 부드러운 트랜지션
 */
export default function Modal({ isOpen, title, onClose, children }) {
  const [isActive, setIsActive] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsActive(true), 10);
    } else if (shouldRender) {
      setIsActive(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className={`modal-overlay ${isActive ? "active" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          <IoClose />
        </button>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
