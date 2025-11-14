import { useEffect } from "react";

export default function ModalContainer() {
  useEffect(() => {
    // 컨테이너 DOM 동적 생성
    const root = document.createElement("div");
    root.id = "global-modal-root";
    document.body.appendChild(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  return null;
}
