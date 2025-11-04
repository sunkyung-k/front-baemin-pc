import { handleApiError } from "@/utills/handleApiError";

/**
 * 공통 에러 핸들링 훅 (alert 유지 버전)
 * -------------------------------------------------
 * - 백엔드 에러: handleApiError → alert(message)
 * - 프론트(로직) 에러: Error 객체 기반 처리
 * - ValidationError(yup 등)는 alert 제외
 * - 콘솔은 한 번만 출력되도록 구조화
 *
 * @returns {(error: any, context?: string) => void}
 */
export const useHandleError = () => {
  const handleError = (error, context = "") => {
    try {
      // yup 등의 클라이언트 ValidationError는 alert 띄우지 않음
      if (error?.name === "ValidationError") return;

      const isAxiosError = !!error?.isAxiosError || !!error?.response;
      let message = "";

      if (isAxiosError) {
        // 백엔드 응답에서 message 추출
        message = handleApiError(error, context);
      } else if (error instanceof Error) {
        // JS 에러
        message = error.message || "클라이언트 오류가 발생했습니다.";
      } else {
        // 예기치 못한 에러
        message = "알 수 없는 오류가 발생했습니다.";
      }

      // 콘솔은 여기서만 출력 (중복 방지)
      const position =
        context || new Error().stack?.split("\n")[2]?.trim() || "unknown";
      console.groupCollapsed(`[ERROR][${position}]`);
      console.error(error);
      console.groupEnd();

      // 사용자 알림 (alert)
      if (typeof window !== "undefined" && message)
        alert(message || "오류가 발생했습니다.");
    } catch (err) {
      console.error("[useHandleError 내부 오류]", err);
      if (typeof window !== "undefined")
        alert("에러 핸들링 중 문제가 발생했습니다.");
    }
  };

  return handleError;
};

export default useHandleError;
