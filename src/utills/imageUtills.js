// src/utills/imageUtills.js
export const getAbsoluteImageUrl = (menu) => {
  if (!menu) return null;

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:9090";

  // filePath가 문자열인지 안전 확인
  const filePath = typeof menu.filePath === "string" ? menu.filePath : null;

  // 가능한 파일명 후보
  const fileName =
    menu.storedId ||
    menu.storedName ||
    menu.fileThumbName ||
    menu.uuid ||
    menu.fileName ||
    "";

  // fileName이 없으면 출력 중단
  if (!fileName) return null;

  // filePath가 /static 형태면 그대로 조합
  if (filePath && filePath.startsWith("/static")) {
    return `${baseUrl}${filePath}${fileName}`;
  }

  // 업로드 경로 포함된 경우
  if (filePath && filePath.includes("/upload")) {
    return `${baseUrl}/static/imgs/${fileName}`;
  }

  // filePath가 없고 fileName만 있는 경우
  return `${baseUrl}/static/imgs/${fileName}`;
};
