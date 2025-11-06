import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { authStore } from "../../store/authStore";
import { eventSourceRef } from "../../utills/eventSourceRef";

export default function OrderStatusNotifier() {
  const token = authStore((state) => state.token);
  const userRole = authStore((state) => state.userRole);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:9090";

    if (!token) return;
    if (userRole !== "ROLE_USER") return; // 점주나 어드민은 SSE 구독 안함

    // 기존 연결이 있으면 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const url = `${baseUrl}/api/v1/sse/subscribe?token=${encodeURIComponent(
      token
    )}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("order-status", (event) => {
      const message = event.data?.trim();
      if (!message) return;

      console.log("SSE 수신:", message);

      if (message.includes("수락")) {
        toast.success(message, {
          position: "bottom-right",
          autoClose: 10000,
          style: { width: "300px", fontSize: "1.1rem" },
        });
      } else if (message.includes("취소")) {
        toast.error(message, {
          position: "bottom-right",
          autoClose: 10000,
          style: { width: "300px", fontSize: "1.1rem" },
        });
      } else {
        toast.info(message, {
          position: "bottom-right",
          autoClose: 10000,
          style: { width: "300px", fontSize: "1.1rem", whiteSpace: "pre-line" },
        });
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE 연결 에러:", err);
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    // 컴포넌트 언마운트 시 닫기
    return () => {
      console.log("SSE 연결 해제됨");
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [token, userRole]);

  return null;
}
