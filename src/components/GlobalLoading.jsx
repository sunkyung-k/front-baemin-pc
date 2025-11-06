import React from "react";
import { useIsFetching } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";

/**
 * 🌐 React Query 전역 로딩 감시
 * - 모든 useQuery / useMutation 요청 중일 때 스피너 표시
 */
export default function GlobalLoading() {
  const isFetching = useIsFetching();

  if (isFetching > 0) {
    return <LoadingSpinner fullscreen />;
  }

  return null;
}
