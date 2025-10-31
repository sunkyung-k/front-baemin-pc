/**
 * 메뉴 객체로부터 절대 경로 이미지 URL 반환
 * - storedId, storedName, uuid, fileName 등 다양한 형태 지원
 * - filePath가 /static, /upload 등 어떤 형태든 안전하게 처리
 */
export const getAbsoluteImageUrl = (menu) => {
  if (!menu) return null;

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:9090";
  const filePath = typeof menu.filePath === "string" ? menu.filePath : "";

  // 파일명 후보를 순서대로 탐색
  const fileName =
    menu.storedId ||
    menu.storedName ||
    menu.fileThumbName ||
    menu.uuid ||
    menu.fileName ||
    "";

  if (!fileName) return null;

  // /static 경로일 경우 → 그대로 baseUrl과 연결
  if (filePath.startsWith("/static")) {
    return `${baseUrl}${filePath}/${fileName}`;
  }

  // /upload 경로가 포함되어 있으면 → 정적 폴더 기준으로 변환
  if (filePath.includes("/upload")) {
    return `${baseUrl}/static/imgs/${fileName}`;
  }

  // filePath가 비어 있고 파일명만 있는 경우
  return `${baseUrl}/static/imgs/${fileName}`;
};
