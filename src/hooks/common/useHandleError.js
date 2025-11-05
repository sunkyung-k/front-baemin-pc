import { handleApiError } from "@/utills/handleApiError";

export const useHandleError = () => {
  const handleError = (error, context = "") => {
    try {
      if (error?.name === "ValidationError") return;

      const isAxiosError = !!error?.isAxiosError || !!error?.response;
      const message = isAxiosError
        ? handleApiError(error)
        : error?.message || "예기치 못한 오류가 발생했습니다.";

      if (import.meta.env.MODE === "development") {
        console.groupCollapsed(`[ERROR][${context}]`);
        console.error(error);
        console.groupEnd();
      }

      if (typeof window !== "undefined" && message) alert(message);
    } catch (err) {
      console.error("[useHandleError 내부 오류]", err);
    }
  };

  return handleError;
};
