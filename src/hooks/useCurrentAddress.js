// import { useState } from "react";
// import { getAddressFromCoords } from "@/utills/kakaoGeocoder";
// import { loadKakaoSDK } from "@/config/kakao";

// // ✅ 내 위치(GPS) 좌표 → 주소 변환 훅
// export function useCurrentAddress() {
//   const [address, setAddress] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchAddress = async () => {
//     await loadKakaoSDK(); // ✅ SDK 강제 로드
//     if (!navigator.geolocation) {
//       alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
//       return;
//     }

//     setLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const { latitude, longitude } = pos.coords;
//           const result = await getAddressFromCoords(longitude, latitude);
//           setAddress(result);
//         } catch (e) {
//           // e는 getAddressFromCoords에서 reject된 "주소 변환 실패" 문자열일 가능성이 높음.
//           console.error("주소 변환 오류:", e);
//           alert(`주소를 가져오는 중 오류가 발생했습니다: ${e}`); // 사용자에게 더 자세한 정보 제공
//         } finally {
//           setLoading(false);
//         }
//       },
//       (err) => {
//         console.error(err);
//         alert("위치 정보를 불러올 수 없습니다.");
//         setLoading(false);
//       }
//     );
//   };

//   return { address, fetchAddress, loading };
// }

import { useState } from "react";
import { getAddressFromCoords } from "@/utills/kakaoGeocoder";
import { loadKakaoSDK } from "@/config/kakao";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * ✅ 내 위치(GPS) 기반 주소 가져오기 훅 (실무형)
 * - SDK 로드 → 위치 요청 → 좌표 → 주소 변환
 * - Zustand 전역 상태까지 자동 반영
 */
export function useCurrentAddress() {
  const [loading, setLoading] = useState(false);
  const setGlobalAddress = useAddressStore((s) => s.setAddress);

  const fetchAddress = async () => {
    try {
      await loadKakaoSDK(); // ✅ SDK 강제 로드
      if (!navigator.geolocation) {
        alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const result = await getAddressFromCoords(longitude, latitude);

            // ✅ 전역 저장
            setGlobalAddress(result);

            console.log("📍 현재 위치 주소:", result);
          } catch (e) {
            console.error("주소 변환 오류:", e);
            alert("주소를 가져오는 중 오류가 발생했습니다.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("❌ 위치 접근 실패:", err);
          if (err.code === 1)
            alert("위치 권한이 거부되었습니다. 브라우저 설정을 확인하세요.");
          else alert("위치 정보를 불러올 수 없습니다.");
          setLoading(false);
        }
      );
    } catch (e) {
      console.error("❌ fetchAddress 실패:", e);
      setLoading(false);
    }
  };

  return { fetchAddress, loading };
}
