export const handleApiError = (error) => {
  const res = error?.response?.data;
  const status = error?.response?.status;
  let message = Array.isArray(res?.errors)
    ? res.errors.join("\n")
    : res?.message || error?.message || "";

  if (!message) {
    if (status === 401) message = "로그인이 필요합니다.";
    else if (status === 403) message = "접근 권한이 없습니다.";
    else if (status >= 500)
      message = "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    else message = "서버 통신 중 오류가 발생했습니다.";
  }

  return message;
};
