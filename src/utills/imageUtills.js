// src/utils/imageUtils.js

/**
 * 업로드된 엔티티(메뉴, 가게, 리뷰 등) 객체로부터 절대 경로 이미지 URL 반환 (공용)
 * - storedId, storedName, uuid, fileName 등 다양한 속성명 지원
 * - filePath가 /static, /upload 등 어떤 형태든 안전하게 처리
 */
export const getAbsoluteImageUrl = (entity) => {
  if (!entity) return null;

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:9090";
  const filePath = typeof entity.filePath === "string" ? entity.filePath : "";

  // 파일명 후보를 순서대로 탐색 (엔티티 종류 관계없이 커버)
  const fileName =
    entity.storedId ||
    entity.storedName ||
    entity.fileThumbName ||
    entity.uuid ||
    entity.fileName ||
    entity.imageName ||
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
