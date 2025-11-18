import { useEffect } from "react";

export default function useFirstVisit() {
  useEffect(() => {
    const alreadyVisited = localStorage.getItem("visited");

    if (!alreadyVisited) {
      // 첫 방문 이벤트 전송
      if (window.gtag) {
        window.gtag("event", "first_visit_custom", {
          timestamp: Date.now(),
        });
      }

      // 첫 방문 기록 저장
      localStorage.setItem("visited", "true");
    }
  }, []);
}
