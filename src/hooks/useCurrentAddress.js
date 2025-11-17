import { getAddressFromCoords } from "@/config/kakao/maps";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useCurrentAddress (전역 로딩 관리 대응 버전)
 * --------------------------------------------------
 * - 브라우저 GPS → Kakao Geocoder 주소 변환
 * - Zustand 전역 상태에만 반영
 * - 로딩 상태는 전역(App.jsx 등)에서 통합 관리
 * - Promise 기반으로 반환 → `await fetchAddress()` 가능
 */
export function useCurrentAddress() {
  const setGlobalAddress = useAddressStore((s) => s.setAddress);

  /** 현재 위치를 불러와 주소로 변환 */
  const fetchAddress = async () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      return null;
    }

    try {
      // GPS 위치 가져오기
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        });
      });

      const { latitude, longitude } = pos.coords;

      // Kakao Geocoder 변환
      const addr = await getAddressFromCoords(longitude, latitude);

      if (!addr) {
        alert("주소를 가져오지 못했습니다.");
        return null;
      }

      // 전역 상태에 반영
      setGlobalAddress(addr);
      // console.log("현재 위치 주소:", addr);
      return addr;
    } catch (err) {
      // console.error("위치 불러오기 실패:", err);
      alert("위치 정보를 가져올 수 없습니다.");
      return null;
    }
  };

  // 로딩은 전역에서 감지하므로 반환하지 않음
  return { fetchAddress };
}

export default useCurrentAddress;
