/**
 * API 에러 처리 (message 추출 전용)
 * -------------------------------------------------
 * - alert은 하지 않음 (UI 훅에서 처리)
 * - 백엔드 응답에서 message, errors 배열 등을 추출
 * - 백엔드/네트워크 오류 메시지를 통합 반환
 *
 * @param {Error} error - Axios 또는 네트워크 에러 객체
 * @param {string} context - 호출 위치(예: "menuAPI.create")
 * @returns {string} message - 사용자에게 보여줄 메시지
 */
export const handleApiError = (error, context = "") => {
  try {
    const res = error?.response?.data;
    const status = error?.response?.status;

    // errors 배열이 있을 경우 줄바꿈으로 합침
    let message = Array.isArray(res?.errors)
      ? res.errors.join("\n")
      : res?.message || error?.message || "";

    // 백엔드 메시지가 없을 때만 기본 메시지 대체
    if (!message) {
      if (status === 401) message = "로그인이 필요합니다.";
      else if (status === 403) message = "접근 권한이 없습니다.";
      else if (status >= 500)
        message = "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      else message = "서버 통신 중 오류가 발생했습니다.";
    }

    // 콘솔 로그 (디버깅용)
    console.error(`[API ERROR][${context}]`, message);

    return message;
  } catch (err) {
    console.error("[handleApiError 내부 오류]", err);
    return "API 에러 처리 중 문제가 발생했습니다.";
  }
};

export default handleApiError;
