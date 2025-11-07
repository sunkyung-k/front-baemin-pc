export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAOMAP_KEY;
let kakaoSDKLoaded = null;

/**
 * Kakao 지도 SDK 로더
 * - Kakao Maps JS SDK를 동적으로 불러와 autoload=false로 명시 초기화
 * - Promise 기반으로 한 번만 로드됨 (중복 방지)
 * - Daum 주소검색 API(Postcode)와는 별개의 스크립트
 */
export async function loadKakaoSDK() {
  if (window.kakao && window.kakao.maps) return Promise.resolve();
  if (kakaoSDKLoaded) return kakaoSDKLoaded;

  kakaoSDKLoaded = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("Kakao SDK 완전 초기화 완료");
        resolve();
      });
    };
    script.onerror = () => reject("Kakao SDK 로드 실패");
    document.head.appendChild(script);
  });

  return kakaoSDKLoaded;
}
