import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useGA() {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;

    const path = location.pathname;

    // store 상세 페이지일 때 storeId 추출
    const storeMatch = path.match(/^\/store\/(\d+)/);
    const storeId = storeMatch ? storeMatch[1] : null;

    window.gtag("event", "page_view", {
      page_path: storeId ? `/store/${storeId}` : path,
      storeId: storeId || null,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}
