import { loadKakaoSDK } from "./index";

/**
 * 좌표 → 주소 변환 (Kakao Geocoder)
 */
export async function getAddressFromCoords(longitude, latitude) {
  await loadKakaoSDK();

  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject("Kakao 지도 서비스 초기화 실패");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(longitude, latitude, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address =
          result[0].road_address?.address_name ||
          result[0].address?.address_name;
        resolve(address);
      } else {
        reject("주소 변환 실패");
      }
    });
  });
}
