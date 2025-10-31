/**
 * 공통 API 에러 핸들러
 * @param {Error} error - Axios 또는 네트워크 에러 객체
 * @param {string} context - 호출 위치(예: "menuAPI.create")
 */
export const handleApiError = (error, context = "") => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "서버 통신 중 오류가 발생했습니다.";

  console.error(`❌ [${context}]`, message);

  // 실무에서는 toast나 modal로 대체 가능 (임시 alert 유지)
  alert(`[${context}] ${message}`);
};
