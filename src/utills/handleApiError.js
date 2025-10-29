/**
 * 공통 에러 핸들러
 * @param {Error} error - Axios 또는 API 에러 객체
 * @param {string} context - 호출 위치 (예: "storeAPI.getList")
 */
export const handleApiError = (error, context = "") => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "서버 통신 중 오류가 발생했습니다.";

  console.error(`❌ [${context}]`, message);

  // 실무에서는 Toast나 Modal로 대체 가능
  alert(`[${context}] ${message}`);
};
