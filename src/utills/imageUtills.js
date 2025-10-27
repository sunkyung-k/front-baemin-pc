/**
 * 이미지 절대 경로 변환 유틸
 */
export const getAbsoluteImageUrl = (path) => {
  if (!path) return "/static/imgs/default.jpg";
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:9090";
  return `${baseUrl}${path}`;
};
