// src/config/kakao.js
export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAOMAP_KEY;

let kakaoSDKLoaded = null;

// src/config/kakao.js
export async function loadKakaoSDK() {
  const origin = window.location.origin;

  if (window.kakao && window.kakao.maps) {
    console.log("✅ Kakao SDK 이미 로드됨");
    return Promise.resolve();
  }

  if (kakaoSDKLoaded) return kakaoSDKLoaded;

  kakaoSDKLoaded = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // ⚠️ async 제거
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      console.log("✅ Kakao SDK 로드 성공:", origin);

      // ✅ autoload=false로 불렀기 때문에 명시적으로 init() 호출
      window.kakao.maps.load(() => {
        console.log("✅ Kakao SDK 완전 초기화됨");
        resolve();
      });
    };
    script.onerror = () => {
      console.error("❌ Kakao SDK 로드 실패:", origin);
      reject();
    };

    document.head.appendChild(script);
  });

  return kakaoSDKLoaded;
}
